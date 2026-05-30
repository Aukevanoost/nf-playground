import { createCustomElement } from '@angular/elements';
import { ensureSharedInjector } from '../../core/shared-injector';
import type { LoadRemoteSlice } from '../../core/remote-loader';
import { EnvironmentConfig } from '../../env.config';
import { ProductPage } from './product.page';

const TAG = 'mfe-product';

export async function bootstrap(
  env: EnvironmentConfig,
  loadRemoteSlice: LoadRemoteSlice,
): Promise<void> {
  const injector = await ensureSharedInjector(env, loadRemoteSlice);
  if (!customElements.get(TAG)) {
    customElements.define(TAG, createCustomElement(ProductPage, { injector }));
  }
}
