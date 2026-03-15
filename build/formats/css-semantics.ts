import StyleDictionary from 'style-dictionary';

/**
 * Generates semantics.css — semantic token utilities.
 * Covers: reset, spacing (numeric 100-1000 + named xxxs-xxxl), typography
 * (font families, font sizes 100-1000), semantic colors, borders, radius,
 * shadows, transitions, interactive states, responsive breakpoints.
 */
StyleDictionary.registerFormat({
  name: 'css/semantics',
  format: ({ dictionary, options }: any) => {
    const brand = options.brandName as string;
    const lines: string[] = [
      '/**',
      ' * Do not edit directly, this file was auto-generated.',
      ' */',
      '',
    ];

    const tokensByPath = new Map<string, any>();
    dictionary.allTokens.forEach((t: any) => tokensByPath.set(t.name, t));
    const ref = (n: string) => `var(--${n})`;
    const has = (n: string) => tokensByPath.has(n);

    // ───────────────────────────── RESET ──────────────────────────────
    lines.push('/* ===== RESET ===== */');
    lines.push('*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }');
    lines.push('html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }');
    lines.push('body {');
    lines.push(`  font-family: ${ref(`${brand}-semantic-typography-font-body`)}, Arial, Helvetica, sans-serif;`);
    lines.push(`  font-size: ${ref(`${brand}-semantic-typography-type-body-default-size`)};`);
    lines.push(`  font-weight: ${ref(`${brand}-semantic-typography-type-body-default-weight`)};`);
    lines.push(`  line-height: ${ref(`${brand}-semantic-typography-type-body-default-line-height`)};`);
    lines.push(`  letter-spacing: ${ref(`${brand}-semantic-typography-type-body-default-letter-spacing`)};`);
    lines.push(`  color: ${ref(`${brand}-semantic-color-text-primary`)};`);
    lines.push(`  background-color: ${ref(`${brand}-semantic-color-background`)};`);
    lines.push('}');
    lines.push('a { color: inherit; text-decoration: inherit; }');
    lines.push('button { font-family: inherit; font-size: inherit; cursor: pointer; border: none; background: none; padding: 0; color: inherit; }');
    lines.push('input, textarea, select { font-family: inherit; font-size: inherit; color: inherit; }');
    lines.push('table { border-collapse: collapse; }');
    lines.push('img, svg { display: block; max-width: 100%; }');
    lines.push('');

    // ───────────────────────────── SPACING ────────────────────────────
    lines.push('/* ===== SPACING ===== */');

    // Helper: emit all directional spacing classes for a given size label
    function spacingClasses(label: string, tokenName: string) {
      lines.push(`.gap-${label} { gap: ${ref(tokenName)}; }`);
      lines.push(`.p-${label} { padding: ${ref(tokenName)}; }`);
      lines.push(`.px-${label} { padding-left: ${ref(tokenName)}; padding-right: ${ref(tokenName)}; }`);
      lines.push(`.py-${label} { padding-top: ${ref(tokenName)}; padding-bottom: ${ref(tokenName)}; }`);
      lines.push(`.pt-${label} { padding-top: ${ref(tokenName)}; }`);
      lines.push(`.pb-${label} { padding-bottom: ${ref(tokenName)}; }`);
      lines.push(`.mb-${label} { margin-bottom: ${ref(tokenName)}; }`);
      lines.push(`.mt-${label} { margin-top: ${ref(tokenName)}; }`);
      lines.push(`.-mt-${label} { margin-top: calc(${ref(tokenName)} * -1); }`);
      lines.push(`.ml-${label} { margin-left: ${ref(tokenName)}; }`);
      lines.push(`.mr-${label} { margin-right: ${ref(tokenName)}; }`);
    }

    // Numeric scale: 100-1000
    lines.push('/* --- numeric scale (100–1000) --- */');
    for (const step of ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000']) {
      const tok = `${brand}-semantic-spacing-${step}`;
      if (has(tok)) spacingClasses(step, tok);
    }

    // Named scale: xxxs → xxxl
    lines.push('');
    lines.push('/* --- named scale --- */');
    for (const name of ['xxxs', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl']) {
      const tok = `${brand}-semantic-spacing-${name}`;
      if (has(tok)) spacingClasses(name, tok);
    }

    // Specials
    lines.push('');
    lines.push('.pt-0 { padding-top: 0; }');
    const sp100 = `${brand}-semantic-spacing-100`;
    if (has(sp100)) {
      lines.push(`.space-y-100 > * + * { margin-top: ${ref(sp100)}; }`);
    }
    lines.push('');

    // ───────────────────────────── TYPOGRAPHY ─────────────────────────
    lines.push('/* ===== TYPOGRAPHY ===== */');

    // Font families
    lines.push(`.font-sans { font-family: ${ref(`${brand}-semantic-typography-font-body`)}, Arial, Helvetica, sans-serif; }`);
    lines.push(`.font-heading { font-family: ${ref(`${brand}-semantic-typography-font-heading`)}, Arial, Helvetica, sans-serif; }`);
    lines.push(`.font-mono { font-family: ${ref(`${brand}-semantic-typography-font-mono`)}, monospace; }`);

    // Font sizes: 100-1000
    for (const step of ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000']) {
      const tok = `${brand}-semantic-typography-size-${step}`;
      if (has(tok)) {
        lines.push(`.text-${step} { font-size: ${ref(tok)}; }`);
      }
    }
    lines.push('');

    // ───────────────────────────── SEMANTIC COLORS ───────────────────
    lines.push('/* ===== SEMANTIC COLORS ===== */');

    // Text colors
    for (const [tok, cls] of Object.entries({
      'text-primary': 'text-primary',
      'text-secondary': 'text-secondary',
      'text-tertiary': 'text-tertiary',
      'text-on-brand': 'text-on-brand',
    } as Record<string, string>)) {
      lines.push(`.${cls} { color: ${ref(`${brand}-semantic-color-${tok}`)}; }`);
    }
    lines.push(`.text-muted { color: ${ref(`${brand}-semantic-color-muted`)}; }`);

    // Feedback text colors
    for (const fb of ['success', 'warning', 'danger', 'info']) {
      lines.push(`.text-${fb} { color: ${ref(`${brand}-semantic-color-feedback-${fb}`)}; }`);
    }

    // Surface backgrounds
    for (const [tok, cls] of Object.entries({
      'surface-base': 'bg-base',
      'surface-sunken': 'bg-sunken',
      'surface-raised': 'bg-raised',
      'surface-overlay': 'bg-overlay',
    } as Record<string, string>)) {
      lines.push(`.${cls} { background-color: ${ref(`${brand}-semantic-color-${tok}`)}; }`);
    }

    // Action backgrounds
    lines.push(`.bg-primary { background-color: ${ref(`${brand}-semantic-color-action-primary`)}; }`);
    lines.push(`.bg-secondary { background-color: ${ref(`${brand}-semantic-color-action-secondary`)}; }`);
    lines.push('');

    // ───────────────────────────── BORDERS & RADIUS ──────────────────
    lines.push('/* ===== BORDERS & RADIUS ===== */');
    lines.push(`.border { border: 1px solid ${ref(`${brand}-semantic-color-border`)}; }`);
    lines.push(`.border-t { border-top: 1px solid ${ref(`${brand}-semantic-color-border`)}; }`);
    lines.push(`.border-b { border-bottom: 1px solid ${ref(`${brand}-semantic-color-border`)}; }`);

    for (const [cls, tok] of Object.entries({
      'rounded': 'border-radius-sm',
      'rounded-md': 'border-radius-md',
      'rounded-lg': 'border-radius-lg',
      'rounded-full': 'border-radius-full',
    } as Record<string, string>)) {
      lines.push(`.${cls} { border-radius: ${ref(`${brand}-semantic-${tok}`)}; }`);
    }
    lines.push('');

    // ───────────────────────────── SHADOWS ────────────────────────────
    lines.push('/* ===== SHADOWS ===== */');
    lines.push(`.shadow-sm { box-shadow: ${ref(`${brand}-semantic-elevation-low`)}; }`);
    lines.push(`.shadow-md { box-shadow: ${ref(`${brand}-semantic-elevation-medium`)}; }`);
    lines.push(`.shadow-lg { box-shadow: ${ref(`${brand}-semantic-elevation-high`)}; }`);
    lines.push('');

    // ───────────────────────────── TRANSITIONS ───────────────────────
    lines.push('/* ===== TRANSITIONS ===== */');
    lines.push(`.transition-colors { transition: background-color ${ref(`${brand}-semantic-duration-fast`)} ease, color ${ref(`${brand}-semantic-duration-fast`)} ease, border-color ${ref(`${brand}-semantic-duration-fast`)} ease; }`);
    lines.push('');

    // ───────────────────────────── INTERACTIVE STATES ────────────────
    lines.push('/* ===== INTERACTIVE STATES ===== */');
    lines.push('.disabled\\:opacity-50:disabled { opacity: 0.5; }');
    lines.push('.disabled\\:opacity-25:disabled { opacity: 0.25; }');
    lines.push('.disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }');
    lines.push(`.focus-ring:focus { outline: none; border-color: ${ref(`${brand}-semantic-color-action-primary`)}; box-shadow: 0 0 0 2px color-mix(in srgb, ${ref(`${brand}-semantic-color-action-primary`)} 30%, transparent); }`);
    lines.push('');

    // ───────────────────────────── RESPONSIVE ────────────────────────
    lines.push('/* ===== RESPONSIVE ===== */');
    const breakpoints: Record<string, string> = {};
    for (const bp of ['sm', 'md', 'lg', 'xl']) {
      const tok = `${brand}-semantic-breakpoint-${bp}`;
      if (has(tok)) {
        const t = tokensByPath.get(tok);
        breakpoints[bp] = t.$value ?? t.value;
      }
    }
    if (breakpoints.sm) {
      lines.push(`@media (min-width: ${breakpoints.sm}) {`);
      lines.push('  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }');
      lines.push('  .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }');
      lines.push('}');
    }
    if (breakpoints.md) {
      lines.push(`@media (min-width: ${breakpoints.md}) {`);
      lines.push('  .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }');
      lines.push('}');
    }
    if (breakpoints.lg) {
      lines.push(`@media (min-width: ${breakpoints.lg}) {`);
      lines.push('  .lg\\:flex-row { flex-direction: row; }');
      lines.push('  .lg\\:w-72 { width: 18rem; }');
      lines.push('  .lg\\:flex-shrink-0 { flex-shrink: 0; }');
      lines.push('  .lg\\:max-h-\\[70vh\\] { max-height: 70vh; }');
      lines.push('  .lg\\:overflow-y-auto { overflow-y: auto; }');
      lines.push('}');
    }
    lines.push('');

    // Brand-prefix post-processing
    const raw = lines.join('\n') + '\n';
    return raw.replace(/(?<!\\)\.(?=[a-zA-Z\-])/g, `.${brand}-`);
  },
});
