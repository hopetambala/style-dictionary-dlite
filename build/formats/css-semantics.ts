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

    // On-dark overlays — translucent white for text/fills/borders on dark surfaces
    if (has('tk-dlite-semantic-color-text-on-dark')) {
      lines.push('/* on dark surfaces */');
      lines.push(`.text-on-dark { color: ${ref(`tk-dlite-semantic-color-text-on-dark`)}; }`);
      lines.push(`.text-on-dark-muted { color: ${ref(`tk-dlite-semantic-color-text-on-dark-muted`)}; }`);
      lines.push(`.text-on-dark-subtle { color: ${ref(`tk-dlite-semantic-color-text-on-dark-subtle`)}; }`);
      lines.push(`.bg-on-dark { background-color: ${ref(`tk-dlite-semantic-color-surface-on-dark`)}; }`);
      lines.push(`.border-on-dark { border: 1px solid ${ref(`tk-dlite-semantic-color-border-on-dark`)}; }`);
      lines.push('');
    }

    // Feedback bg/fg pairs — for badges, status cards, alerts
    if (has('tk-dlite-semantic-color-feedback-success-bg')) {
      lines.push('/* feedback surfaces (bg + fg pairs) */');
      for (const fb of ['success', 'danger', 'warning', 'info']) {
        lines.push(`.bg-${fb}-subtle { background-color: ${ref(`tk-dlite-semantic-color-feedback-${fb}-bg`)}; }`);
        lines.push(`.text-${fb}-strong { color: ${ref(`tk-dlite-semantic-color-feedback-${fb}-fg`)}; }`);
      }
      lines.push('');
    }

    // ───────────────────────────── Z-INDEX LAYERS ─────────────────────
    if (has('tk-dlite-semantic-z-index-modal')) {
      lines.push('/* ===== Z-INDEX LAYERS ===== */');
      for (const layer of ['default', 'sticky', 'dropdown', 'overlay', 'modal']) {
        lines.push(`.z-${layer} { z-index: ${ref(`tk-dlite-semantic-z-index-${layer}`)}; }`);
      }
      lines.push('');
    }

    // ───────────────────────────── BORDERS & RADIUS ──────────────────
    lines.push('/* ===== BORDERS & RADIUS ===== */');
    lines.push(`.border { border: 1px solid ${ref(`tk-dlite-semantic-color-border`)}; }`);
    lines.push(`.border-subtle { border: 1px solid ${ref(`tk-dlite-semantic-color-border-subtle`)}; }`);
    lines.push(`.border-emphasis { border: 1px solid ${ref(`tk-dlite-semantic-color-border-emphasis`)}; }`);
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
    // Brand-aware focus glow — use on :focus-visible for inputs/controls
    lines.push(`.shadow-focus { box-shadow: 0 0 0 3px color-mix(in srgb, ${ref(`tk-dlite-semantic-color-action-primary`)} 15%, transparent); }`);
    lines.push('');

    // ───────────────────────────── SIZING ─────────────────────────────
    if (has('tk-dlite-semantic-sizing-icon-md')) {
      lines.push('/* ===== SIZING ===== */');
      for (const s of ['sm', 'md', 'lg']) {
        const tok = `tk-dlite-semantic-sizing-icon-${s}`;
        lines.push(`.icon-${s} { width: ${ref(tok)}; height: ${ref(tok)}; }`);
      }
      for (const w of ['narrow', 'normal', 'wide']) {
        lines.push(`.max-w-modal-${w} { max-width: ${ref(`tk-dlite-semantic-sizing-modal-width-${w}`)}; }`);
      }
      lines.push('');
    }

    // ───────────────────────────── MOTION ─────────────────────────────
    // Duration + easing utilities, sourced from semantic.motion.* tokens.
    if (has('tk-dlite-semantic-motion-duration-base')) {
      lines.push('/* ===== MOTION: DURATION ===== */');
      for (const d of ['quick', 'snappy', 'base', 'substantial', 'slow', 'xslow']) {
        lines.push(`.duration-${d} { transition-duration: ${ref(`tk-dlite-semantic-motion-duration-${d}`)}; }`);
      }
      lines.push('');
      lines.push('/* ===== MOTION: EASING ===== */');
      for (const e of ['standard', 'entrance', 'exit', 'linear']) {
        lines.push(`.ease-${e} { transition-timing-function: ${ref(`tk-dlite-semantic-motion-easing-${e}`)}; }`);
      }
      lines.push('');
    }

    // ───────────────────────────── TRANSITIONS ───────────────────────
    lines.push('/* ===== TRANSITIONS ===== */');
    lines.push(`.transition-colors { transition: background-color ${ref(`tk-dlite-semantic-motion-duration-quick`)} ${ref(`tk-dlite-semantic-motion-easing-standard`)}, color ${ref(`tk-dlite-semantic-motion-duration-quick`)} ${ref(`tk-dlite-semantic-motion-easing-standard`)}, border-color ${ref(`tk-dlite-semantic-motion-duration-quick`)} ${ref(`tk-dlite-semantic-motion-easing-standard`)}; }`);
    lines.push(`.transition-transform { transition: transform ${ref(`tk-dlite-semantic-motion-duration-base`)} ${ref(`tk-dlite-semantic-motion-easing-standard`)}; }`);
    lines.push(`.transition-opacity { transition: opacity ${ref(`tk-dlite-semantic-motion-duration-base`)} ${ref(`tk-dlite-semantic-motion-easing-standard`)}; }`);
    lines.push(`.transition-all { transition: all ${ref(`tk-dlite-semantic-motion-duration-base`)} ${ref(`tk-dlite-semantic-motion-easing-standard`)}; }`);
    lines.push('');

    // ───────────────────────────── TRANSFORMS ────────────────────────
    if (has('tk-dlite-semantic-motion-scale-hover')) {
      lines.push('/* ===== TRANSFORMS ===== */');
      lines.push(`.scale-hover:hover { transform: scale(${ref(`tk-dlite-semantic-motion-scale-hover`)}); }`);
      lines.push(`.scale-active:active { transform: scale(${ref(`tk-dlite-semantic-motion-scale-active`)}); }`);
      lines.push('');
    }

    // ───────────────────────────── INTERACTIVE STATES ────────────────
    lines.push('/* ===== INTERACTIVE STATES ===== */');
    lines.push(`.focus-ring:focus { outline: none; border-color: ${ref(`tk-dlite-semantic-color-action-primary`)}; box-shadow: 0 0 0 2px color-mix(in srgb, ${ref(`tk-dlite-semantic-color-action-primary`)} 30%, transparent); }`);
    lines.push('');

    // Brand-prefix post-processing
    const raw = lines.join('\n') + '\n';
    return raw.replace(/(?<!\\)\.(?=[a-zA-Z\-])/g, `.cl-dlite-sem-`);
  },
});
