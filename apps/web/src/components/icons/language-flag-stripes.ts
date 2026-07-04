export type StripeLayout = 'horizontal' | 'vertical';

export interface StripeFlagSpec {
  layout: StripeLayout;
  colors: string[];
  weights?: number[];
}

export const STRIPE_FLAGS: Record<string, StripeFlagSpec> = {
  bg: { layout: 'horizontal', colors: ['#fff', '#00966E', '#D62612'] },
  de: { layout: 'horizontal', colors: ['#000', '#DD0000', '#FFCE00'] },
  es: { layout: 'horizontal', colors: ['#AA151B', '#F1BF00', '#AA151B'], weights: [1, 2, 1] },
  et: { layout: 'horizontal', colors: ['#0072CE', '#000', '#fff'] },
  fr: { layout: 'vertical', colors: ['#0055A4', '#fff', '#EF4135'] },
  ga: { layout: 'vertical', colors: ['#169B62', '#fff', '#FF883E'] },
  hu: { layout: 'horizontal', colors: ['#CE2939', '#fff', '#477050'] },
  it: { layout: 'vertical', colors: ['#009246', '#fff', '#CE2B37'] },
  lt: { layout: 'horizontal', colors: ['#FDB913', '#006A44', '#C1272D'] },
  lv: { layout: 'horizontal', colors: ['#9E3039', '#fff', '#9E3039'] },
  nl: { layout: 'horizontal', colors: ['#AE1C28', '#fff', '#21468B'] },
  pl: { layout: 'horizontal', colors: ['#fff', '#DC143C'] },
  ro: { layout: 'vertical', colors: ['#002B7F', '#FCD116', '#CE1126'] },
  ru: { layout: 'horizontal', colors: ['#fff', '#0039A6', '#D52B1E'] },
  uk: { layout: 'horizontal', colors: ['#005BBB', '#FFD500'] },
};
