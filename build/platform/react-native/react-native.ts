export function reactNativePlatform(brandName: string, theme: string, mode: string) {
  return {
    rn: {
      brandName,
      transforms: ['attribute/cti', 'value/dtcg-color', 'value/shadow-css', 'name/brand-tier-camel'],
      buildPath: `dist/rn/${brandName}/${theme}/.tmp/`,
      files: [
        {
          destination: `${mode}.json`,
          format: 'json/flat-map',
        },
      ],
    },
  };
}
