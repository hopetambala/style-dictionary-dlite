import type { TokenTree } from '../../types.ts';

export function webPlatform(brandName: string, theme: string, mode: string) {
  return {
    web: {
      brandName,
      transforms: ['attribute/cti', 'value/dtcg-color', 'value/shadow-css', 'name/brand-tier-kebab'],
      buildPath: `dist/web/${brandName}/${theme}/`,
      files: [
        {
          destination: mode === 'light' ? 'variables.css' : `variables.${mode}.css`,
          format: 'css/variables',
        },
      ],
    },
  };
}
