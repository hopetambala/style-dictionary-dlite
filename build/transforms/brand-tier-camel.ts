import StyleDictionary from 'style-dictionary';

StyleDictionary.registerTransform({
  name: 'name/brand-tier-camel',
  type: 'name',
  transform: (token: any) => {
    const tokenPath: string[] = token.path;
    const isPrimitive = tokenPath[0] === 'primitive';
    const tier = isPrimitive ? 'primitive' : 'semantic';
    const segments = isPrimitive ? tokenPath.slice(1) : tokenPath;
    const parts = ['tk-dlite', tier, ...segments]
      .flatMap((s) => s.split('-'))
      .map((s, i) =>
        i === 0
          ? s.toLowerCase()
          : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
      )
      .join('');
    return parts;
  },
});
