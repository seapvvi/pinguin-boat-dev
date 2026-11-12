import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

/**
 * SSRF guard for URLs that come from user input (guild settings, embeds,
 * webhooks configured through the dashboard).
 *
 * Blocks anything that is not http(s), anything that resolves to a private,
 * loopback, link-local or cloud-metadata address, and anything that is not an
 * image when fetched through `fetchRemoteImage`.
 */

const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8_000;

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeUrlError';
  }
}

function isPrivateIp(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local / metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast + reserved
    return false;
  }

  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fe80') || normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }
  if (normalized.startsWith('::ffff:')) return isPrivateIp(normalized.slice('::ffff:'.length));
  return false;
}

/** Throw when the URL must not be fetched by the server. */
export async function assertSafeRemoteUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError('Invalid URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeUrlError(`Unsupported protocol: ${url.protocol}`);
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '');

  // A literal IP is checked directly; a name is resolved first.
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new UnsafeUrlError('Private address');
    return url;
  }

  const lowered = hostname.toLowerCase();
  if (lowered === 'localhost' || lowered.endsWith('.localhost') || lowered.endsWith('.internal')) {
    throw new UnsafeUrlError('Local hostname');
  }

  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(lowered, { all: true });
  } catch {
    throw new UnsafeUrlError('Unresolvable host');
  }

  if (addresses.length === 0) throw new UnsafeUrlError('Unresolvable host');
  for (const entry of addresses) {
    if (isPrivateIp(entry.address)) throw new UnsafeUrlError('Private address');
  }

  return url;
}

/** Fetch an image after validating the URL and the response. */
export async function fetchRemoteImage(rawUrl: string): Promise<Buffer> {
  const url = await assertSafeRemoteUrl(rawUrl);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'error',
      headers: { Accept: 'image/*' },
    });

    if (!response.ok) {
      throw new UnsafeUrlError(`Image request failed: ${response.status}`);
    }

    const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim();
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      throw new UnsafeUrlError(`Unsupported content type: ${contentType || 'unknown'}`);
    }

    const declaredLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES) {
      throw new UnsafeUrlError('Image too large');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      throw new UnsafeUrlError('Image too large');
    }
    return buffer;
  } finally {
    clearTimeout(timer);
  }
}