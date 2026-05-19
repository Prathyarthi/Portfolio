import { encode } from 'qss';

export function getPreviewImage(url: string): string {
  const params = encode({
    url,
    screenshot: true,
    meta: false,
    embed: 'screenshot.url',
    colorScheme: 'dark',
    'viewport.isMobile': false,
    'viewport.deviceScaleFactor': 1,
    'viewport.width': 1440,
    'viewport.height': 900,
    ttl: '1d',
  });

  return `https://api.microlink.io/?${params}`;
}
