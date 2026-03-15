import StyleDictionary from 'style-dictionary';

/**
 * Custom name transform to generate kebab-case token names with a fixed
 * design-system prefix and tier:
 * - Primitive tokens: tk-dlite-primitive-{tokenPath}
 * - Semantic tokens: tk-dlite-semantic-{tokenPath}
 */
StyleDictionary.registerTransform({
  name: 'name/brand-tier-kebab',
  type: 'name',
  transform: (token: any) => {
    const tokenPath: string[] = token.path;
    const isPrimitive = tokenPath[0] === 'primitive';
    const tier = isPrimitive ? 'primitive' : 'semantic';
    const segments = isPrimitive ? tokenPath.slice(1) : tokenPath;
    return ['tk-dlite', tier, ...segments].join('-');
  },
});
