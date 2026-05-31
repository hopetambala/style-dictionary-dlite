import StyleDictionary from 'style-dictionary';

/**
 * Custom value transform to convert DTCG cubicBezier tokens to CSS strings.
 * Expects easing tokens to have a value like:
 * [x1, y1, x2, y2]
 * Transforms to a CSS string like "cubic-bezier(0.42, 0, 0.58, 1)".
 *
 * Web-only: the React Native platform leaves the raw array in place so consumers
 * can pass it to Reanimated's `Easing.bezier(...array)`.
 */
StyleDictionary.registerTransform({
  name: 'value/cubic-bezier-css',
  type: 'value',
  transitive: true,
  filter: (token: any) => token.$type === 'cubicBezier',
  transform: (token: any) => {
    const val = token.$value ?? token.value;
    if (Array.isArray(val) && val.length === 4) {
      return `cubic-bezier(${val.join(', ')})`;
    }
    return val;
  },
});
