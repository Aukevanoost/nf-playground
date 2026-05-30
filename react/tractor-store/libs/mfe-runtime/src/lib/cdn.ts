import { toCdnUrl } from '@react-internal/federation';

export const cdnUrl = (path: string, base: string): string =>
  toCdnUrl(path, base);

export const imgSrc = (image: string, size: number, base: string): string =>
  toCdnUrl(image.replace('[size]', `${size}`), base);

export const imgSrcset = (
  image: string,
  sizes: readonly number[],
  base: string,
): string =>
  sizes
    .map((s) => `${toCdnUrl(image.replace('[size]', `${s}`), base)} ${s}w`)
    .join(', ');
