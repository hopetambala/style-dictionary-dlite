import StyleDictionary from 'style-dictionary';

StyleDictionary.registerTransform({
  name: 'value/dtcg-color',
  type: 'value',
  transitive: true,
  filter: (token: any) => token.$type === 'color',
  transform: (token: any) => {
    const val = token.$value ?? token.value;
    if (val && typeof val === 'object' && val.colorSpace && val.components) {
      if (val.hex) return val.hex;
      const [r, g, b] = val.components;
      const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    return val;
  },
});
