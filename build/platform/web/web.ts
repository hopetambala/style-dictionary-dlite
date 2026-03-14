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
                destination: 'utilities.css',
                format: 'css/utilities',
                options: { brandName },
              },
            ]
          : []),
      ],
    },
  };
}
