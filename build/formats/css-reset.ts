import StyleDictionary from 'style-dictionary';

/**
 * Generates reset.css — global CSS reset referencing semantic tokens
 * for body defaults (font, color, background).
 */
StyleDictionary.registerFormat({
  name: 'css/reset',
  format: ({ dictionary }: any) => {
    const ref = (n: string) => `var(--${n})`;

    const lines: string[] = [
      '/**',
      ' * Do not edit directly, this file was auto-generated.',
      ' */',
      '',
      '/* ===== RESET ===== */',
      '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',
      'html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }',
      'body {',
      `  font-family: ${ref(`tk-dlite-semantic-typography-font-body`)}, Arial, Helvetica, sans-serif;`,
      `  font-size: ${ref(`tk-dlite-semantic-typography-type-body-default-size`)};`,
      `  font-weight: ${ref(`tk-dlite-semantic-typography-type-body-default-weight`)};`,
      `  line-height: ${ref(`tk-dlite-semantic-typography-type-body-default-line-height`)};`,
      `  letter-spacing: ${ref(`tk-dlite-semantic-typography-type-body-default-letter-spacing`)};`,
      `  color: ${ref(`tk-dlite-semantic-color-text-primary`)};`,
      `  background-color: ${ref(`tk-dlite-semantic-color-background`)};`,
      '}',
      'a { color: inherit; text-decoration: inherit; }',
      'button { font-family: inherit; font-size: inherit; cursor: pointer; border: none; background: none; padding: 0; color: inherit; }',
      'input, textarea, select { font-family: inherit; font-size: inherit; color: inherit; }',
      'table { border-collapse: collapse; }',
      'img, svg { display: block; max-width: 100%; }',
      '',
    ];

    return lines.join('\n') + '\n';
  },
});
