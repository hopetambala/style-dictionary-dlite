import StyleDictionary from 'style-dictionary';

/**
 * Generates semantics.css — semantic token utilities.
 * Covers: spacing (numeric 100-1000 + named xxxs-xxxl), typography
 * (font families, font sizes 100-1000), semantic colors, borders, radius,
 * shadows, transitions, focus-ring.
 */
StyleDictionary.registerFormat({
  name: 'css/semantics',
  format: ({ dictionary, options }: any) => {
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
      const tok = `tk-dlite-semantic-spacing-${step}`;
      if (has(tok)) spacingClasses(step, tok);
    }

    // Named scale: xxxs → xxxl
    lines.push('');
    lines.push('/* --- named scale --- */');
    for (const name of ['xxxs', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl']) {
      const tok = `tk-dlite-semantic-spacing-${name}`;
      if (has(tok)) spacingClasses(name, tok);
    }
    lines.push('');

    // ───────────────────────────── TYPOGRAPHY ─────────────────────────
    lines.push('/* ===== TYPOGRAPHY ===== */');

    // Font families
    lines.push(`.font-sans { font-family: ${ref(`tk-dlite-semantic-typography-font-body`)}, Arial, Helvetica, sans-serif; }`);
    lines.push(`.font-heading { font-family: ${ref(`tk-dlite-semantic-typography-font-heading`)}, Arial, Helvetica, sans-serif; }`);
    lines.push(`.font-mono { font-family: ${ref(`tk-dlite-semantic-typography-font-mono`)}, monospace; }`);

    // Font sizes: 100-1000
    for (const step of ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000']) {
      const tok = `tk-dlite-semantic-typography-size-${step}`;
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
      'text-on-primary': 'text-on-primary',
    } as Record<string, string>)) {
      lines.push(`.${cls} { color: ${ref(`tk-dlite-semantic-color-${tok}`)}; }`);
    }
    lines.push(`.text-muted { color: ${ref(`tk-dlite-semantic-color-muted`)}; }`);

    // Feedback text colors
    for (const fb of ['success', 'warning', 'danger', 'info']) {
      lines.push(`.text-${fb} { color: ${ref(`tk-dlite-semantic-color-feedback-${fb}`)}; }`);
    }

    // Surface backgrounds
    for (const [tok, cls] of Object.entries({
      'surface-base': 'bg-base',
      'surface-sunken': 'bg-sunken',
      'surface-raised': 'bg-raised',
      'surface-overlay': 'bg-overlay',
    } as Record<string, string>)) {
      lines.push(`.${cls} { background-color: ${ref(`tk-dlite-semantic-color-${tok}`)}; }`);
    }

    // Action backgrounds
    lines.push(`.bg-primary { background-color: ${ref(`tk-dlite-semantic-color-action-primary`)}; }`);
    lines.push(`.bg-secondary { background-color: ${ref(`tk-dlite-semantic-color-action-secondary`)}; }`);
    lines.push('');

    // ───────────────────────────── BORDERS & RADIUS ──────────────────
    lines.push('/* ===== BORDERS & RADIUS ===== */');
    lines.push(`.border { border: 1px solid ${ref(`tk-dlite-semantic-color-border`)}; }`);
    lines.push(`.border-t { border-top: 1px solid ${ref(`tk-dlite-semantic-color-border`)}; }`);
    lines.push(`.border-r { border-right: 1px solid ${ref(`tk-dlite-semantic-color-border`)}; }`);
    lines.push(`.border-b { border-bottom: 1px solid ${ref(`tk-dlite-semantic-color-border`)}; }`);
    lines.push(`.border-l { border-left: 1px solid ${ref(`tk-dlite-semantic-color-border`)}; }`);

    for (const [cls, tok] of Object.entries({
      'rounded': 'border-radius-sm',
      'rounded-md': 'border-radius-md',
      'rounded-lg': 'border-radius-lg',
      'rounded-full': 'border-radius-full',
    } as Record<string, string>)) {
      lines.push(`.${cls} { border-radius: ${ref(`tk-dlite-semantic-${tok}`)}; }`);
    }
    lines.push('');

    // ───────────────────────────── SHADOWS ────────────────────────────
    lines.push('/* ===== SHADOWS ===== */');
    lines.push(`.shadow-sm { box-shadow: ${ref(`tk-dlite-semantic-elevation-low`)}; }`);
    lines.push(`.shadow-md { box-shadow: ${ref(`tk-dlite-semantic-elevation-medium`)}; }`);
    lines.push(`.shadow-lg { box-shadow: ${ref(`tk-dlite-semantic-elevation-high`)}; }`);
    lines.push('');

    // ───────────────────────────── TRANSITIONS ───────────────────────
    lines.push('/* ===== TRANSITIONS ===== */');
    lines.push(`.transition-colors { transition: background-color ${ref(`tk-dlite-semantic-duration-fast`)} ease, color ${ref(`tk-dlite-semantic-duration-fast`)} ease, border-color ${ref(`tk-dlite-semantic-duration-fast`)} ease; }`);
    lines.push('');

    // ───────────────────────────── INTERACTIVE STATES ────────────────
    lines.push('/* ===== INTERACTIVE STATES ===== */');
    lines.push(`.focus-ring:focus { outline: none; border-color: ${ref(`tk-dlite-semantic-color-action-primary`)}; box-shadow: 0 0 0 2px color-mix(in srgb, ${ref(`tk-dlite-semantic-color-action-primary`)} 30%, transparent); }`);
    lines.push('');

    // Brand-prefix post-processing
    const raw = lines.join('\n') + '\n';
    return raw.replace(/(?<!\\)\.(?=[a-zA-Z\-])/g, `.cl-dlite-sem-`);
  },
});
