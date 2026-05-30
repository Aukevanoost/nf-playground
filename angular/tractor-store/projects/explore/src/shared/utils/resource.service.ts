import { inject, Injectable } from '@angular/core';
import { toCdnUrl } from '@ng-internal/federation';
import { ENV } from '../../env.config';

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly env = inject(ENV);

  cdnUrl(path: string): string {
    return toCdnUrl(path, this.env.cdnUrl);
  }

  imgSrc(image: string, size: number): string {
    return this.cdnUrl(image.replace('[size]', `${size}`));
  }

  imgSrcset(image: string, sizes: readonly number[] = []): string {
    return sizes
      .map((size) => `${this.imgSrc(image, size)} ${size}w`)
      .join(', ');
  }
}
