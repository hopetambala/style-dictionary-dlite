import StyleDictionary from 'style-dictionary';

/**
 * Custom value transform to convert DTCG color objects to hex strings.
 * Expects color tokens to have a value like:
 * {
 *   colorSpace: 'srgb',
 *   components: [r, g, b],
 *   hex: '#rrggbb' // optional, if present will be used directly
 * }
 * Transforms to a hex string like "#rrggbb".
 */
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
