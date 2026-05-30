import type { RecommendationModel } from '../core/data/contracts/models/recommendation.model';

/** Single recommendation item — used by the per-item display components and as
 *  a generic stand-in when only one recommendation needs to be rendered. */
export const recommendationFixture: RecommendationModel = {
  sku: 'AU-01-SI',
  name: 'TerraFirma Silver',
  image: '/img/[size]/AU-01-SI.webp',
  link: { intent: 'decide.product', params: { id: 'AU-01', sku: 'AU-01-SI' } },
  rgb: [192, 192, 192],
};

/** Five recommendations whose RGB values are tuned for the colour-distance
 *  algorithm in `RecommendationHttp.bySeedSkus`. Do not reorder or retune
 *  these without updating the spec expectations. */
export const recommendationMapFixture: Record<string, RecommendationModel> = {
  'CL-01-GY': {
    sku: 'CL-01-GY',
    name: 'Heritage Workhorse Grey',
    image: '/img/CL-01-GY.webp',
    link: { intent: 'decide.product', params: { id: 'CL-01', variant: 'GY' } },
    rgb: [120, 120, 120],
  },
  'CL-02-RD': {
    sku: 'CL-02-RD',
    name: 'Classic Red',
    image: '/img/CL-02-RD.webp',
    link: { intent: 'decide.product', params: { id: 'CL-02', variant: 'RD' } },
    rgb: [200, 30, 30],
  },
  'CL-03-BL': {
    sku: 'CL-03-BL',
    name: 'Classic Blue',
    image: '/img/CL-03-BL.webp',
    link: { intent: 'decide.product', params: { id: 'CL-03', variant: 'BL' } },
    rgb: [30, 60, 200],
  },
  'CL-04-GR': {
    sku: 'CL-04-GR',
    name: 'Classic Green',
    image: '/img/CL-04-GR.webp',
    link: { intent: 'decide.product', params: { id: 'CL-04', variant: 'GR' } },
    rgb: [40, 160, 60],
  },
  'CL-05-DK': {
    sku: 'CL-05-DK',
    name: 'Dark Slate',
    image: '/img/CL-05-DK.webp',
    link: { intent: 'decide.product', params: { id: 'CL-05', variant: 'DK' } },
    rgb: [110, 110, 110],
  },
};
