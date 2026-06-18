/**
 * Normalizes a URL to ensure it has a proper protocol.
 * If the URL doesn't start with a protocol, assumes https://
 * 
 * @param url - The URL to normalize (can be null/undefined)
 * @returns Normalized URL with protocol, or null if input is empty
 * 
 * @example
 * normalizeUrl('example.com') // 'https://example.com'
 * normalizeUrl('http://example.com') // 'http://example.com'
 * normalizeUrl('https://example.com') // 'https://example.com'
 * normalizeUrl('') // null
 */
export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  const trimmed = url.trim();
  if (!trimmed) return null;
  
  // Already has a protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Has protocol-relative format (//example.com)
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  
  // No protocol, add https://
  return `https://${trimmed}`;
}
