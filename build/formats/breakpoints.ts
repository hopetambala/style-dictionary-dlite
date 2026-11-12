import StyleDictionary from 'style-dictionary';

/**
 * Global breakpoint outputs, generated from `semantic.breakpoint`.
 *
 * CSS custom properties can't be used inside `@media`, so these two formats
 * give consumers breakpoints they can actually query with:
 * - `css/custom-media` → `@custom-media --tk-dlite-bp-{name}-up|-down`
 *   (needs postcss-custom-media or a browser that supports it)
 * - `json/breakpoints` → `{ "sm": 640, ... }` for JS (e.g. an MUI theme)
 *
 * `-down` uses `max-width: <bp - 0.02px>` so `-down` and `-up` never overlap,
 * including at fractional widths on high-DPI screens.
 */

type Breakpoint = { name: string; px: number };

function breakpoints(dictionary: any): Breakpoint[] {
  return dictionary.allTokens
    .filter((t: any) => t.path[t.path.length - 2] === 'breakpoint')
    .map((t: any) => {
      const raw = String(t.$value ?? t.value);
      const m = /^(\d+(?:\.\d+)?)px$/.exec(raw);
      if (!m) throw new Error(`Breakpoint ${t.path.join('.')} must be in px, got "${raw}"`);
      return { name: t.path[t.path.length - 1], px: Number(m[1]) };
    })
    .sort((a: Breakpoint, b: Breakpoint) => a.px - b.px);
}

const DOWN_OFFSET = 0.02;

StyleDictionary.registerFormat({
  name: 'css/custom-media',
  format: ({ dictionary }: any) => {
    const lines = [
      '/**',
      ' * Do not edit directly, this file was auto-generated.',
      ' * Breakpoint media queries. Requires postcss-custom-media (or native @custom-media support).',
      ' * Usage: @media (--tk-dlite-bp-md-up) { ... }',
      ' */',
      '',
    ];
    for (const { name, px } of breakpoints(dictionary)) {
      const down = Math.round((px - DOWN_OFFSET) * 100) / 100;
      lines.push(`@custom-media --tk-dlite-bp-${name}-up (min-width: ${px}px);`);
      lines.push(`@custom-media --tk-dlite-bp-${name}-down (max-width: ${down}px);`);
    }
    return lines.join('\n') + '\n';
  },
});

StyleDictionary.registerFormat({
  name: 'json/breakpoints',
  format: ({ dictionary }: any) => {
    const obj = Object.fromEntries(breakpoints(dictionary).map(({ name, px }) => [name, px]));
    return JSON.stringify(obj, null, 2) + '\n';
  },
});
