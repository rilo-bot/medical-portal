/**
 * Storage service interface — the rest of the app calls only these functions.
 * Concrete implementation: S3-compatible via @aws-sdk/client-s3 (RILO managed storage).
 */
export interface StorageUploadResult {
  key: string;
  url: string;
}

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/env.js';

function buildKey(suffix: string): string {
  const prefix = env.s3KeyPrefix ? env.s3KeyPrefix.replace(/\/$/, '') + '/' : '';
  return `${prefix}${suffix}`;
}

function getClient(): S3Client {
  return new S3Client({
    endpoint: env.s3Endpoint || undefined,
    region: env.s3Region,
    credentials: {
      accessKeyId: env.s3AccessKeyId,
      secretAccessKey: env.s3SecretAccessKey,
    },
    forcePathStyle: true,
  });
}

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<StorageUploadResult> {
  if (!env.s3Bucket) throw Object.assign(new Error('Storage not configured'), { status: 503 });
  const fullKey = buildKey(key);
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: env.s3Bucket,
      Key: fullKey,
      Body: body,
      ContentType: contentType,
    }),
  );
  return { key: fullKey, url: `${env.s3Endpoint}/${env.s3Bucket}/${fullKey}` };
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!env.s3Bucket) throw Object.assign(new Error('Storage not configured'), { status: 503 });
  const client = getClient();
  const cmd = new GetObjectCommand({ Bucket: env.s3Bucket, Key: buildKey(key) });
  return getSignedUrl(client, cmd, { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  if (!env.s3Bucket) return;
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: env.s3Bucket, Key: buildKey(key) }));
}

export async function getFileBuffer(key: string): Promise<Buffer> {
  if (!env.s3Bucket) throw Object.assign(new Error('Storage not configured'), { status: 503 });
  const client = getClient();
  const resp = await client.send(new GetObjectCommand({ Bucket: env.s3Bucket, Key: buildKey(key) }));
  const stream = resp.Body as AsyncIterable<Uint8Array>;
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}
