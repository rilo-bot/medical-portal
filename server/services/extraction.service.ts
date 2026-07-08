/**
 * Text extraction from various source types.
 * Returns { text, pageCount }.
 */
import { createRequire } from 'module';
import { lookup as dnsLookup } from 'node:dns/promises';
import { isIPv4 } from 'node:net';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

const require = createRequire(import.meta.url);

// ─── SSRF guard for ingestUrl/reindex ────────────────────────────────────────
// URL ingestion lets a user tell the server to fetch an arbitrary address. Without this check
// that's a straightforward SSRF into internal services / cloud metadata endpoints (169.254.169.254).

function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  const [a, b] = parts;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 0) return true; // "this network"
  return false;
}

function isPrivateOrReservedIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1') return true; // loopback
  if (lower.startsWith('fe80:') || lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true; // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local (fc00::/7)
  if (lower.startsWith('::ffff:')) return isPrivateOrReservedIPv4(lower.slice(7)); // IPv4-mapped
  return false;
}

async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw Object.assign(new Error('Invalid URL'), { status: 400 });
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw Object.assign(new Error('Only http/https URLs are allowed'), { status: 400 });
  }

  const { address } = await dnsLookup(parsed.hostname).catch(() => {
    throw Object.assign(new Error('Could not resolve URL host'), { status: 400 });
  });
  const isPrivate = isIPv4(address) ? isPrivateOrReservedIPv4(address) : isPrivateOrReservedIPv6(address);
  if (isPrivate) {
    throw Object.assign(new Error('URL resolves to a private or reserved address'), { status: 400 });
  }
  return parsed;
}

export interface ExtractionResult {
  text: string;
  pageCount: number | null;
}

export async function extractText(
  buffer: Buffer,
  sourceType: 'pdf' | 'docx' | 'txt' | 'html',
): Promise<ExtractionResult> {
  switch (sourceType) {
    case 'pdf': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>;
      const result = await pdfParse(buffer);
      return { text: result.text, pageCount: result.numpages };
    }
    case 'docx': {
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value, pageCount: null };
    }
    case 'txt': {
      return { text: buffer.toString('utf-8'), pageCount: null };
    }
    case 'html': {
      const $ = cheerio.load(buffer.toString('utf-8'));
      $('script, style, noscript').remove();
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      return { text, pageCount: null };
    }
    default:
      return { text: '', pageCount: null };
  }
}

export async function fetchUrl(url: string): Promise<ExtractionResult> {
  await assertPublicHttpUrl(url);
  const fetch = (await import('node-fetch')).default;
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'MedicalAssistantBot/1.0' },
    redirect: 'manual', // don't blindly follow a redirect into a private address after the check above
  });
  if (resp.status >= 300 && resp.status < 400) {
    throw Object.assign(new Error('URL redirects are not followed for security reasons'), { status: 400 });
  }
  if (!resp.ok) throw Object.assign(new Error(`Failed to fetch URL: ${resp.status}`), { status: 400 });
  const html = await resp.text();
  const $ = cheerio.load(html);
  $('script, style, noscript, nav, footer, header').remove();
  const title = $('title').text().trim();
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  return { text: title ? `${title}\n\n${text}` : text, pageCount: null };
}
