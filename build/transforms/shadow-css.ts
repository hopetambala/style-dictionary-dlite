import StyleDictionary from 'style-dictionary';

/**
 * Custom value transform to convert shadow tokens to CSS box-shadow strings.
 * Expects shadow tokens to have a value like:
 * {
 *   offsetX: '2px',
 *   offsetY: '4px',
 *   blur: '6px',
 *   spread: '0px',
 *   color: '#000000'
 * }
 * Transforms to a CSS string like "2px 4px 6px 0px #000000".
 */
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
