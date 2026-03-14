import StyleDictionary from 'style-dictionary';

StyleDictionary.registerTransform({
  name: 'value/shadow-css',
  type: 'value',
  transitive: true,
  filter: (token: any) => token.$type === 'shadow',
  transform: (token: any) => {
    const val = token.$value ?? token.value;
    if (val && typeof val === 'object' && val.offsetX !== undefined) {
      return `${val.offsetX} ${val.offsetY} ${val.blur} ${val.spread} ${val.color}`;
    }
    return val;
  },
});
