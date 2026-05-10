import type { ProductModel } from '../core/data/contracts/models/product.model';

export const productFixture: ProductModel = {
  id: 'CL-01',
  name: 'Heritage Workhorse',
  image: '/img/[size]/CL-01.webp',
  startPrice: 5700,
  link: { intent: 'decide.product', params: { id: 'CL-01' } },
};
