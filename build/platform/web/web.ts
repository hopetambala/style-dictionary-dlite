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
        ...(mode === 'light'
          ? [
              {
                destination: 'reset.css',
                format: 'css/reset',
                options: { brandName },
              },
              {
                destination: 'utilities.css',
                format: 'css/utilities',
                options: { brandName },
              },
              {
                destination: 'primitives.css',
                format: 'css/primitives',
                options: { brandName },
              },
              {
                destination: 'semantics.css',
                format: 'css/semantics',
                options: { brandName },
              },
              {
                destination: 'components.css',
                format: 'css/components',
                options: { brandName },
              },
            ]
          : []),
      ],
    },
  };
}
