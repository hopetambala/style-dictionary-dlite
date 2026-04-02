import StyleDictionary from 'style-dictionary';
import fs from 'node:fs';

/**
 * Generates reset.css — global CSS reset referencing semantic tokens
 * for body defaults (font, color, background).
 */
StyleDictionary.registerFormat({
  name: 'css/reset',
  format: ({ dictionary, options }: any) => {
    const ref = (n: string) => `var(--${n})`;

    const lines: string[] = [
      '/**',
      ' * Do not edit directly, this file was auto-generated.',
      ' */',
      '',
    ];

    // Include fonts.css for Kooky brand (only if fonts are available)
    if (options?.brandName === 'kooky' && fs.existsSync('.fonts-available')) {
      lines.push(`@import './fonts/fonts.css';`, '');
    }

    lines.push('/* ===== RESET ===== */');
    lines.push('*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }');
    lines.push('html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }');
    lines.push('body {');
    lines.push(`  font-family: ${ref(`tk-dlite-semantic-typography-font-body`)}, Arial, Helvetica, sans-serif;`);
    lines.push(`  font-size: ${ref(`tk-dlite-semantic-typography-type-body-default-size`)};`);
    lines.push(`  font-weight: ${ref(`tk-dlite-semantic-typography-type-body-default-weight`)};`);
    lines.push(`  line-height: ${ref(`tk-dlite-semantic-typography-type-body-default-line-height`)};`);
    lines.push(`  letter-spacing: ${ref(`tk-dlite-semantic-typography-type-body-default-letter-spacing`)};`);
    lines.push(`  color: ${ref(`tk-dlite-semantic-color-text-primary`)};`);
    lines.push(`  background-color: ${ref(`tk-dlite-semantic-color-background`)};`);
    lines.push('}');
    lines.push('a { color: inherit; text-decoration: inherit; }');
    lines.push('button { font-family: inherit; font-size: inherit; cursor: pointer; border: none; background: none; padding: 0; color: inherit; }');
    lines.push('input, textarea, select { font-family: inherit; font-size: inherit; color: inherit; }');
    lines.push('table { border-collapse: collapse; }');
    lines.push('img, svg { display: block; max-width: 100%; }');
    lines.push('');

    return lines.join('\n') + '\n';
  },
});
