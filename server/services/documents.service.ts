import crypto from 'crypto';
import path from 'path';
import { KBDocument } from '../models/KBDocument.js';
import { Chunk } from '../models/Chunk.js';
import { uploadFile } from './storage/index.js';
import { extractText, fetchUrl } from './extraction.service.js';
import { indexDocumentSafe, hashContent } from './indexing.service.js';
import { deleteFile } from './storage/index.js';
import type { SourceType } from '../models/KBDocument.js';

function detectSourceType(filename: string): SourceType {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  const map: Record<string, SourceType> = {
    pdf: 'pdf',
    docx: 'docx',
    doc: 'docx',
    txt: 'txt',
    html: 'html',
    htm: 'html',
  };
  return map[ext] ?? 'txt';
}

export async function listDocuments(collectionId?: string) {
  const filter = collectionId ? { collectionId } : {};
  const docs = await KBDocument.find(filter).sort({ createdAt: -1 }).lean();
  return docs.map((d) => ({
    id: d._id.toString(),
    collectionId: d.collectionId.toString(),
    title: d.title,
    sourceType: d.sourceType,
    version: d.version,
    status: d.status,
    pageCount: d.pageCount,
    createdAt: (d.createdAt as Date).toISOString(),
  }));
}

/** Extracts text from a buffer and indexes it, marking the document 'failed' on any error. */
function extractAndIndexInBackground(
  documentId: string,
  fileBuffer: Buffer,
  sourceType: SourceType,
): void {
  (async () => {
    try {
      const { text, pageCount } = await extractText(fileBuffer, sourceType as 'pdf' | 'docx' | 'txt' | 'html');
      if (pageCount) await KBDocument.findByIdAndUpdate(documentId, { pageCount });
      await indexDocumentSafe(documentId, text);
    } catch (err) {
      console.error('async indexing error:', err instanceof Error ? err.message : err);
      await KBDocument.findByIdAndUpdate(documentId, { status: 'failed' });
    }
  })();
}

export async function uploadDocument(
  fileBuffer: Buffer,
  originalName: string,
  collectionId: string,
  userId: string,
): Promise<{ id: string; title: string; status: string; duplicate: boolean }> {
  const sourceType = detectSourceType(originalName);
  const contentHash = hashContent(fileBuffer.toString('base64'));

  // Dedupe check
  const existing = await KBDocument.findOne({ contentHash, collectionId });
  if (existing) {
    if (existing.status === 'failed') {
      // Same content as a previous failed attempt — retry indexing instead of silently
      // returning the stale 'failed' status forever with no way to recover from the UI.
      const newVersion = existing.version + 1;
      await KBDocument.findByIdAndUpdate(existing.id, { version: newVersion, status: 'processing' });
      extractAndIndexInBackground(existing.id, fileBuffer, sourceType);
      return { id: existing.id, title: existing.title, status: 'processing', duplicate: true };
    }
    return {
      id: existing.id,
      title: existing.title,
      status: existing.status,
      duplicate: true,
    };
  }

  // Upload to storage
  const storageKey = `documents/${collectionId}/${Date.now()}-${originalName}`;
  await uploadFile(storageKey, fileBuffer, `application/octet-stream`);

  const doc = await KBDocument.create({
    collectionId,
    title: path.basename(originalName, path.extname(originalName)),
    sourceType,
    sourceUrl: null,
    version: 1,
    contentHash,
    status: 'processing',
    pageCount: null,
    storageKey,
    uploadedBy: userId,
  });

  extractAndIndexInBackground(doc.id, fileBuffer, sourceType);

  return { id: doc.id, title: doc.title, status: 'processing', duplicate: false };
}

function ingestUrlInBackground(documentId: string, url: string): void {
  (async () => {
    try {
      const { text } = await fetchUrl(url);
      // Use the page title from extracted text as the title (first line)
      const title = text.split('\n')[0]?.slice(0, 200) || url;
      await KBDocument.findByIdAndUpdate(documentId, { title });
      await indexDocumentSafe(documentId, text);
    } catch (err) {
      console.error('URL indexing error:', err instanceof Error ? err.message : err);
      await KBDocument.findByIdAndUpdate(documentId, { status: 'failed' });
    }
  })();
}

export async function ingestUrl(
  url: string,
  collectionId: string,
  userId: string,
): Promise<{ id: string; title: string; status: string }> {
  const contentHash = hashContent(url);
  const existing = await KBDocument.findOne({ contentHash, collectionId });
  if (existing) {
    if (existing.status === 'failed') {
      // Same URL as a previous failed attempt — retry instead of returning the stale status.
      const newVersion = existing.version + 1;
      await KBDocument.findByIdAndUpdate(existing.id, { version: newVersion, status: 'processing' });
      ingestUrlInBackground(existing.id, url);
      return { id: existing.id, title: existing.title, status: 'processing' };
    }
    return { id: existing.id, title: existing.title, status: existing.status };
  }

  const doc = await KBDocument.create({
    collectionId,
    title: url,
    sourceType: 'url',
    sourceUrl: url,
    version: 1,
    contentHash,
    status: 'processing',
    pageCount: null,
    storageKey: null,
    uploadedBy: userId,
  });

  ingestUrlInBackground(doc.id, url);

  return { id: doc.id, title: url, status: 'processing' };
}

export async function reindexDocument(
  documentId: string,
): Promise<{ id: string; version: number; status: string }> {
  const doc = await KBDocument.findById(documentId);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  const newVersion = doc.version + 1;
  await KBDocument.findByIdAndUpdate(documentId, { version: newVersion, status: 'processing' });

  (async () => {
    try {
      let text = '';
      if (doc.sourceType === 'url' && doc.sourceUrl) {
        const result = await fetchUrl(doc.sourceUrl);
        text = result.text;
      } else if (doc.storageKey) {
        const { getFileBuffer } = await import('./storage/index.js');
        const buffer = await getFileBuffer(doc.storageKey);
        const result = await extractText(buffer, doc.sourceType as 'pdf' | 'docx' | 'txt' | 'html');
        text = result.text;
      }
      await indexDocumentSafe(documentId, text);
    } catch (err) {
      console.error('reindex error:', err instanceof Error ? err.message : err);
      await KBDocument.findByIdAndUpdate(documentId, { status: 'failed' });
    }
  })();

  return { id: documentId, version: newVersion, status: 'processing' };
}

export async function deleteDocument(documentId: string): Promise<void> {
  const doc = await KBDocument.findById(documentId);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  // Delete chunks — this also removes their embeddings, which live on the same documents
  await Chunk.deleteMany({ documentId });

  // Delete from storage
  if (doc.storageKey) {
    await deleteFile(doc.storageKey).catch(() => {});
  }

  await KBDocument.findByIdAndDelete(documentId);
}
