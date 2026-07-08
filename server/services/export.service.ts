/**
 * Export a message (with citations) to PDF or DOCX.
 * Uploads the generated file to storage and returns a signed URL.
 */
import PDFDocument from 'pdfkit';
import { Document as DocxDocument, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { v4 as uuidv4 } from 'uuid';
import { uploadFile, getSignedDownloadUrl } from './storage/index.js';
import type { ICitation } from '../models/Message.js';

async function generatePdf(content: string, citations: ICitation[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('Clinical Assistant — Response', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666666').text(new Date().toLocaleString(), { align: 'center' });
    doc.moveDown(1);

    // Content
    doc.fontSize(11).font('Helvetica').fillColor('#000000').text(content, { lineGap: 4 });
    doc.moveDown(1);

    // Citations
    if (citations.length > 0) {
      doc.fontSize(13).font('Helvetica-Bold').text('References');
      doc.moveDown(0.3);
      citations.forEach((c, i) => {
        const ref = `${i + 1}. ${c.title}${c.section ? ` — ${c.section}` : ''}${c.page ? ` (p.${c.page})` : ''}`;
        doc.fontSize(10).font('Helvetica').text(ref, { lineGap: 2 });
        if (c.snippet) {
          doc.fontSize(9).font('Helvetica-Oblique').fillColor('#555555').text(`   "${c.snippet}"`, { lineGap: 2 });
          doc.fillColor('#000000');
        }
      });
    }

    doc.end();
  });
}

async function generateDocx(content: string, citations: ICitation[]): Promise<Buffer> {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'Clinical Assistant — Response',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: new Date().toLocaleString(), color: '666666', size: 18 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' }),
    ...content.split('\n').map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
        }),
    ),
    new Paragraph({ text: '' }),
  ];

  if (citations.length > 0) {
    paragraphs.push(
      new Paragraph({ text: 'References', heading: HeadingLevel.HEADING_2 }),
    );
    citations.forEach((c, i) => {
      const ref = `${i + 1}. ${c.title}${c.section ? ` — ${c.section}` : ''}${c.page ? ` (p.${c.page})` : ''}`;
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: ref, size: 20 })] }));
      if (c.snippet) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `"${c.snippet}"`, italics: true, color: '555555', size: 18 })],
          }),
        );
      }
    });
  }

  const doc = new DocxDocument({
    sections: [{ properties: {}, children: paragraphs }],
  });

  return Packer.toBuffer(doc);
}

export async function exportMessage(
  messageId: string,
  content: string,
  citations: ICitation[],
  format: 'pdf' | 'docx',
): Promise<{ url: string; filename: string }> {
  const ext = format === 'pdf' ? 'pdf' : 'docx';
  const filename = `response-${messageId}-${Date.now()}.${ext}`;
  const key = `exports/${filename}`;

  let buffer: Buffer;
  let contentType: string;

  if (format === 'pdf') {
    buffer = await generatePdf(content, citations);
    contentType = 'application/pdf';
  } else {
    buffer = await generateDocx(content, citations);
    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  const { key: uploadedKey } = await uploadFile(key, buffer, contentType);
  const url = await getSignedDownloadUrl(uploadedKey, 3600);

  return { url, filename };
}
