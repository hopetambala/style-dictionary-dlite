import StyleDictionary from 'style-dictionary';

/**
 * Custom format to output a flat JSON map of token names to values.
 * Example output:
 * {
 *   "colorBackground": "#ffffff",
 *   "spacingSmall": "8px",
 *   ...
 * }
 * This format ignores the token hierarchy and outputs all tokens in a single flat object.
 */
StyleDictionary.registerFormat({
  name: 'json/flat-map',
  format: ({ dictionary }) => {
    const obj: Record<string, unknown> = {};
    for (const token of dictionary.allTokens) {
      obj[token.name] = token.$value ?? token.value;
    }
    return JSON.stringify(obj, null, 2);
  },
});
