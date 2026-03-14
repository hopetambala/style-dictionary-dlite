import StyleDictionary from 'style-dictionary';

/**
 * Custom name transform to generate kebab-case token names with brand and tier:
 * - Primitive tokens: {brand}-primitive-{tokenPath}
 * - Semantic tokens: {brand}-semantic-{tokenPath}
 * Example: "acme-primitive-color-background" or "acme-semantic-color-background"
 */
StyleDictionary.registerTransform({
  name: 'name/brand-tier-kebab',
  type: 'name',
  transform: (token: any, options: any) => {
    const brand = options.brandName;
    const tokenPath: string[] = token.path;
    const isPrimitive = tokenPath[0] === 'primitive';
    const tier = isPrimitive ? 'primitive' : 'semantic';
    const segments = isPrimitive ? tokenPath.slice(1) : tokenPath;
    return [brand, tier, ...segments].join('-');
  },
});
