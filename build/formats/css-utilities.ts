import StyleDictionary from 'style-dictionary';

// ---------------------------------------------------------------------------
// Custom format: utility CSS classes generated from tokens
// ---------------------------------------------------------------------------
StyleDictionary.registerFormat({
  name: 'css/utilities',
  format: ({ dictionary, options }: any) => {
    const brand = options.brandName as string;
    const lines: string[] = [
      '/**',
      ' * Do not edit directly, this file was auto-generated.',
      ' */',
      '',
    ];

    // Helpers
    const tokensByPath = new Map<string, any>();
    dictionary.allTokens.forEach((t: any) => {
      tokensByPath.set(t.name, t);
    });

    // Get the CSS var reference for a token name
    function ref(tokenName: string): string {
      return `var(--${tokenName})`;
    }

    // ============= RESET =============
    lines.push('/* ===== RESET ===== */');
    lines.push('*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }');
    lines.push('html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }');
    lines.push(`body {`);
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

    // ============= LAYOUT =============
    lines.push('/* ===== LAYOUT ===== */');
    const layoutClasses: Record<string, string> = {
      'block': 'display: block',
      'inline-block': 'display: inline-block',
      'flex': 'display: flex',
      'inline-flex': 'display: inline-flex',
      'grid': 'display: grid',
      'hidden': 'display: none',
      'flex-col': 'flex-direction: column',
      'flex-row': 'flex-direction: row',
      'flex-wrap': 'flex-wrap: wrap',
      'flex-nowrap': 'flex-wrap: nowrap',
      'flex-1': 'flex: 1 1 0%',
      'flex-auto': 'flex: 1 1 auto',
      'flex-shrink-0': 'flex-shrink: 0',
      'items-start': 'align-items: flex-start',
      'items-center': 'align-items: center',
      'items-end': 'align-items: flex-end',
      'items-stretch': 'align-items: stretch',
      'justify-start': 'justify-content: flex-start',
      'justify-center': 'justify-content: center',
      'justify-end': 'justify-content: flex-end',
      'justify-between': 'justify-content: space-between',
      'relative': 'position: relative',
      'absolute': 'position: absolute',
      'fixed': 'position: fixed',
      'sticky': 'position: sticky',
      'top-0': 'top: 0',
      'left-0': 'left: 0',
      'right-0': 'right: 0',
      'bottom-0': 'bottom: 0',
      'z-10': 'z-index: 10',
      'overflow-hidden': 'overflow: hidden',
      'overflow-x-auto': 'overflow-x: auto',
      'overflow-y-auto': 'overflow-y: auto',
      'w-full': 'width: 100%',
      'w-fit': 'width: fit-content',
      'min-w-0': 'min-width: 0',
      'min-w-full': 'min-width: 100%',
      'max-w-full': 'max-width: 100%',
      'h-8': 'height: 2rem',
      'min-h-screen': 'min-height: 100vh',
      'mx-auto': 'margin-left: auto; margin-right: auto',
      'cursor-pointer': 'cursor: pointer',
      'cursor-not-allowed': 'cursor: not-allowed',
    };
    for (const [cls, val] of Object.entries(layoutClasses)) {
      lines.push(`.${cls} { ${val}; }`);
    }

    // Numeric widths
    const widths: Record<string, string> = { '6': '1.5rem', '8': '2rem', '12': '3rem', '16': '4rem', '20': '5rem', '24': '6rem', '28': '7rem' };
    for (const [n, v2] of Object.entries(widths)) {
      lines.push(`.w-${n} { width: ${v2}; }`);
    }

    // Min widths
    const minWidths: Record<string, string> = { '20': '5rem', '48': '12rem' };
    for (const [n, v2] of Object.entries(minWidths)) {
      lines.push(`.min-w-${n} { min-width: ${v2}; }`);
    }

    // Max widths
    const maxWidths: Record<string, string> = { 'xs': '20rem', 'sm': '24rem', 'lg': '32rem', '2xl': '42rem', '4xl': '56rem', '7xl': '80rem' };
    for (const [n, v2] of Object.entries(maxWidths)) {
      lines.push(`.max-w-${n} { max-width: ${v2}; }`);
    }

    // Grid columns
    for (const n of [2, 3, 4]) {
      lines.push(`.grid-cols-${n} { grid-template-columns: repeat(${n}, minmax(0, 1fr)); }`);
    }
    lines.push('');

    // ============= SPACING (token-backed) =============
    lines.push('/* ===== SPACING ===== */');

    // Semantic gap classes
    const semanticSpacingNames = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
    for (const size of semanticSpacingNames) {
      const tokenName = `${brand}-semantic-spacing-${size}`;
      if (tokensByPath.has(tokenName)) {
        lines.push(`.gap-${size} { gap: ${ref(tokenName)}; }`);
      }
    }

    // Numeric spacing (token-backed via semantic.spacing.N)
    const numericSpacing = ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16'];
    for (const n of numericSpacing) {
      const tokenName = `${brand}-semantic-spacing-${n}`;
      if (tokensByPath.has(tokenName)) {
        lines.push(`.gap-${n} { gap: ${ref(tokenName)}; }`);
        lines.push(`.p-${n} { padding: ${ref(tokenName)}; }`);
        lines.push(`.px-${n} { padding-left: ${ref(tokenName)}; padding-right: ${ref(tokenName)}; }`);
        lines.push(`.py-${n} { padding-top: ${ref(tokenName)}; padding-bottom: ${ref(tokenName)}; }`);
        lines.push(`.pt-${n} { padding-top: ${ref(tokenName)}; }`);
        lines.push(`.pb-${n} { padding-bottom: ${ref(tokenName)}; }`);
        lines.push(`.mb-${n} { margin-bottom: ${ref(tokenName)}; }`);
        lines.push(`.mt-${n} { margin-top: ${ref(tokenName)}; }`);
        lines.push(`.-mt-${n} { margin-top: calc(${ref(tokenName)} * -1); }`);
        lines.push(`.ml-${n} { margin-left: ${ref(tokenName)}; }`);
        lines.push(`.mr-${n} { margin-right: ${ref(tokenName)}; }`);
      }
    }

    // 2xs for half-step spacing (py-0.5)
    const twoXsToken = `${brand}-semantic-spacing-2xs`;
    if (tokensByPath.has(twoXsToken)) {
      lines.push(`.py-0\\.5 { padding-top: ${ref(twoXsToken)}; padding-bottom: ${ref(twoXsToken)}; }`);
    }
    // Zero padding
    lines.push('.pt-0 { padding-top: 0; }');
    // Space-y helper
    lines.push(`.space-y-1 > * + * { margin-top: ${ref(`${brand}-semantic-spacing-1`)}; }`);
    lines.push('');

    // ============= TYPOGRAPHY (token-backed) =============
    lines.push('/* ===== TYPOGRAPHY ===== */');

    // Font families
    lines.push(`.font-sans { font-family: ${ref(`${brand}-semantic-typography-font-body`)}, Arial, Helvetica, sans-serif; }`);
    lines.push(`.font-heading { font-family: ${ref(`${brand}-semantic-typography-font-heading`)}, Arial, Helvetica, sans-serif; }`);
    lines.push(`.font-mono { font-family: ${ref(`${brand}-semantic-typography-font-mono`)}, monospace; }`);

    // Font sizes
    const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
    for (const size of fontSizes) {
      const tokenName = `${brand}-semantic-typography-size-${size}`;
      if (tokensByPath.has(tokenName)) {
        lines.push(`.text-${size} { font-size: ${ref(tokenName)}; }`);
      }
    }

    // Font weights
    const weights: Record<string, string> = {
      'normal': 'regular',
      'medium': 'medium',
      'semibold': 'semibold',
      'bold': 'bold',
    };
    for (const [cls, token] of Object.entries(weights)) {
      lines.push(`.font-${cls} { font-weight: ${ref(`${brand}-primitive-fontWeight-${token}`)}; }`);
    }

    // Text alignment
    lines.push('.text-left { text-align: left; }');
    lines.push('.text-center { text-align: center; }');
    lines.push('.text-right { text-align: right; }');

    // Decoration
    lines.push('.underline { text-decoration: underline; }');
    lines.push('.line-through { text-decoration: line-through; }');
    lines.push('.no-underline { text-decoration: none; }');

    // White space
    lines.push('.whitespace-nowrap { white-space: nowrap; }');
    lines.push('.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }');

    // Letter spacing
    lines.push(`.tracking-tight { letter-spacing: ${ref(`${brand}-primitive-dimension-letter-spacing-tight`)}; }`);
    lines.push(`.tracking-wide { letter-spacing: ${ref(`${brand}-primitive-dimension-letter-spacing-wide`)}; }`);
    lines.push(`.tracking-widest { letter-spacing: ${ref(`${brand}-primitive-dimension-letter-spacing-widest`)}; }`);
    lines.push('');

    // ============= COLORS (token-backed) =============
    lines.push('/* ===== COLORS — Semantic =====*/');

    // Semantic text colors
    const semanticTextColors: Record<string, string> = {
      'primary': 'text-primary',
      'secondary': 'text-secondary',
      'tertiary': 'text-tertiary',
      'on-brand': 'text-on-brand',
    };
    for (const [token, cls] of Object.entries(semanticTextColors)) {
      lines.push(`.text-${cls.replace('text-', '')} { color: ${ref(`${brand}-semantic-color-text-${token}`)}; }`);
    }
    lines.push(`.text-muted { color: ${ref(`${brand}-semantic-color-muted`)}; }`);

    // Semantic feedback text colors
    const feedbackColors = ['success', 'warning', 'danger', 'info'];
    for (const fb of feedbackColors) {
      lines.push(`.text-${fb} { color: ${ref(`${brand}-semantic-color-feedback-${fb}`)}; }`);
    }

    // Semantic backgrounds
    lines.push(`.bg-base { background-color: ${ref(`${brand}-semantic-color-surface-base`)}; }`);
    lines.push(`.bg-sunken { background-color: ${ref(`${brand}-semantic-color-surface-sunken`)}; }`);
    lines.push(`.bg-raised { background-color: ${ref(`${brand}-semantic-color-surface-raised`)}; }`);
    lines.push(`.bg-overlay { background-color: ${ref(`${brand}-semantic-color-surface-overlay`)}; }`);
    lines.push(`.bg-primary { background-color: ${ref(`${brand}-semantic-color-action-primary`)}; }`);
    lines.push(`.bg-secondary { background-color: ${ref(`${brand}-semantic-color-action-secondary`)}; }`);

    lines.push('');
    lines.push('/* ===== COLORS — Primitive ===== */');

    // Primitive color classes for all hues
    lines.push(`.text-white { color: ${ref(`${brand}-primitive-color-white`)}; }`);
    lines.push(`.bg-white { background-color: ${ref(`${brand}-primitive-color-white`)}; }`);

    const colorHues = ['neutral', 'blue', 'green', 'yellow', 'orange', 'red', 'mint', 'teal', 'purple', 'pink'];
    const colorSteps = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
    // Map hue names to shorter class names (neutral → gray)
    const hueAlias: Record<string, string> = { 'neutral': 'gray' };

    for (const hue of colorHues) {
      const cls = hueAlias[hue] || hue;
      for (const step of colorSteps) {
        const tokenName = `${brand}-primitive-color-${hue}-${step}`;
        if (tokensByPath.has(tokenName)) {
          lines.push(`.text-${cls}-${step} { color: ${ref(tokenName)}; }`);
          lines.push(`.bg-${cls}-${step} { background-color: ${ref(tokenName)}; }`);
          lines.push(`.border-${cls}-${step} { border-color: ${ref(tokenName)}; }`);
        }
      }
    }

    // hover:bg-* and hover:text-* for all primitives
    lines.push('');
    lines.push('/* ===== HOVER STATES ===== */');
    for (const hue of colorHues) {
      const cls = hueAlias[hue] || hue;
      for (const step of colorSteps) {
        const tokenName = `${brand}-primitive-color-${hue}-${step}`;
        if (tokensByPath.has(tokenName)) {
          lines.push(`.hover\\:bg-${cls}-${step}:hover { background-color: ${ref(tokenName)}; }`);
          lines.push(`.hover\\:text-${cls}-${step}:hover { color: ${ref(tokenName)}; }`);
        }
      }
    }
    lines.push(`.hover\\:bg-gray-50:hover { background-color: ${ref(`${brand}-primitive-color-neutral-100`)}; }`);

    // Opacity (from primitive number tokens)
    lines.push('');
    lines.push('/* ===== OPACITY ===== */');
    const namedOpacities = ['25', '50', '60'];
    for (const op of namedOpacities) {
      const tokenStep = op === '25' ? '20' : op === '50' ? '40' : '60';
      lines.push(`.opacity-${op} { opacity: ${ref(`${brand}-primitive-number-opacity-${tokenStep}`)}; }`);
    }
    lines.push('');

    // ============= BORDERS (token-backed) =============
    lines.push('/* ===== BORDERS ===== */');
    lines.push(`.border { border: 1px solid ${ref(`${brand}-semantic-color-border`)}; }`);
    lines.push(`.border-t { border-top: 1px solid ${ref(`${brand}-semantic-color-border`)}; }`);
    lines.push(`.border-b { border-bottom: 1px solid ${ref(`${brand}-semantic-color-border`)}; }`);

    // Border radius
    lines.push(`.rounded { border-radius: ${ref(`${brand}-semantic-border-radius-sm`)}; }`);
    lines.push(`.rounded-md { border-radius: ${ref(`${brand}-semantic-border-radius-md`)}; }`);
    lines.push(`.rounded-lg { border-radius: ${ref(`${brand}-semantic-border-radius-lg`)}; }`);
    lines.push(`.rounded-full { border-radius: ${ref(`${brand}-semantic-border-radius-full`)}; }`);

    // Shadows
    lines.push(`.shadow-sm { box-shadow: ${ref(`${brand}-semantic-elevation-low`)}; }`);
    lines.push(`.shadow-md { box-shadow: ${ref(`${brand}-semantic-elevation-medium`)}; }`);
    lines.push(`.shadow-lg { box-shadow: ${ref(`${brand}-semantic-elevation-high`)}; }`);
    lines.push('');

    // ============= COMPONENTS =============
    lines.push('/* ===== COMPONENTS — Buttons ===== */');
    lines.push(`.btn {`);
    lines.push(`  display: inline-flex; align-items: center; justify-content: center;`);
    lines.push(`  font-weight: ${ref(`${brand}-primitive-fontWeight-medium`)};`);
    lines.push(`  border-radius: ${ref(`${brand}-semantic-border-radius-lg`)};`);
    lines.push(`  padding: ${ref(`${brand}-semantic-spacing-2`)} ${ref(`${brand}-semantic-spacing-4`)};`);
    lines.push(`  transition: background-color ${ref(`${brand}-semantic-duration-fast`)} ease, color ${ref(`${brand}-semantic-duration-fast`)} ease, opacity ${ref(`${brand}-semantic-duration-fast`)} ease;`);
    lines.push(`  cursor: pointer; white-space: nowrap;`);
    lines.push('}');
    lines.push('.btn:disabled { opacity: 0.5; cursor: not-allowed; }');
    lines.push(`.btn-primary { background-color: ${ref(`${brand}-semantic-color-action-primary`)}; color: ${ref(`${brand}-semantic-color-text-on-brand`)}; }`);
    lines.push(`.btn-primary:hover:not(:disabled) { background-color: ${ref(`${brand}-primitive-color-blue-700`)}; }`);
    lines.push(`.btn-success { background-color: ${ref(`${brand}-semantic-color-feedback-success`)}; color: ${ref(`${brand}-semantic-color-text-on-brand`)}; }`);
    lines.push(`.btn-success:hover:not(:disabled) { background-color: ${ref(`${brand}-primitive-color-green-700`)}; }`);
    lines.push(`.btn-danger { background-color: ${ref(`${brand}-semantic-color-feedback-danger`)}; color: ${ref(`${brand}-semantic-color-text-on-brand`)}; }`);
    lines.push(`.btn-danger:hover:not(:disabled) { background-color: ${ref(`${brand}-primitive-color-red-800`)}; }`);
    lines.push(`.btn-secondary { background-color: ${ref(`${brand}-semantic-color-action-secondary`)}; color: ${ref(`${brand}-semantic-color-text-primary`)}; }`);
    lines.push(`.btn-secondary:hover:not(:disabled) { background-color: ${ref(`${brand}-primitive-color-neutral-300`)}; }`);
    lines.push(`.btn-sm { font-size: ${ref(`${brand}-semantic-typography-size-sm`)}; padding: ${ref(`${brand}-semantic-spacing-1`)} ${ref(`${brand}-semantic-spacing-3`)}; }`);
    lines.push(`.btn-lg { padding: ${ref(`${brand}-semantic-spacing-3`)} ${ref(`${brand}-semantic-spacing-6`)}; }`);
    lines.push('.btn-link { background: none; padding: 0; text-decoration: underline; }');
    lines.push('.btn-link:hover { opacity: 0.8; }');

    lines.push('');
    lines.push('/* ===== COMPONENTS — Inputs ===== */');
    lines.push(`.input {`);
    lines.push(`  border: 1px solid ${ref(`${brand}-semantic-color-border`)};`);
    lines.push(`  border-radius: ${ref(`${brand}-semantic-border-radius-lg`)};`);
    lines.push(`  padding: ${ref(`${brand}-semantic-spacing-2`)} ${ref(`${brand}-semantic-spacing-3`)};`);
    lines.push(`  background-color: ${ref(`${brand}-semantic-color-surface-base`)};`);
    lines.push(`  color: ${ref(`${brand}-semantic-color-text-primary`)};`);
    lines.push('  width: 100%;');
    lines.push(`  transition: border-color ${ref(`${brand}-semantic-duration-fast`)} ease, box-shadow ${ref(`${brand}-semantic-duration-fast`)} ease;`);
    lines.push('}');
    lines.push(`.input:focus { outline: none; border-color: ${ref(`${brand}-semantic-color-action-primary`)}; box-shadow: 0 0 0 2px color-mix(in srgb, ${ref(`${brand}-semantic-color-action-primary`)} 30%, transparent); }`);
    lines.push(`.input-lg { padding: ${ref(`${brand}-semantic-spacing-3`)} ${ref(`${brand}-semantic-spacing-4`)}; }`);

    lines.push('');
    lines.push('/* ===== COMPONENTS — Badges ===== */');
    lines.push(`.badge {`);
    lines.push(`  display: inline-flex; align-items: center;`);
    lines.push(`  font-size: ${ref(`${brand}-semantic-typography-size-xs`)};`);
    lines.push(`  font-weight: ${ref(`${brand}-primitive-fontWeight-medium`)};`);
    lines.push(`  padding: ${ref(`${brand}-semantic-spacing-2xs`)} ${ref(`${brand}-semantic-spacing-2`)};`);
    lines.push(`  border-radius: ${ref(`${brand}-semantic-border-radius-full`)};`);
    lines.push('}');
    lines.push(`.badge-success { background-color: ${ref(`${brand}-primitive-color-green-200`)}; color: ${ref(`${brand}-primitive-color-green-800`)}; }`);
    lines.push(`.badge-warning { background-color: ${ref(`${brand}-primitive-color-yellow-200`)}; color: ${ref(`${brand}-primitive-color-yellow-800`)}; }`);
    lines.push(`.badge-danger { background-color: ${ref(`${brand}-primitive-color-red-200`)}; color: ${ref(`${brand}-primitive-color-red-800`)}; }`);
    lines.push(`.badge-neutral { background-color: ${ref(`${brand}-primitive-color-neutral-200`)}; color: ${ref(`${brand}-primitive-color-neutral-600`)}; }`);
    lines.push(`.badge-info { background-color: ${ref(`${brand}-primitive-color-blue-200`)}; color: ${ref(`${brand}-primitive-color-blue-800`)}; }`);

    lines.push('');
    lines.push('/* ===== COMPONENTS — Cards ===== */');
    lines.push(`.card {`);
    lines.push(`  border: 1px solid ${ref(`${brand}-semantic-color-border`)};`);
    lines.push(`  border-radius: ${ref(`${brand}-semantic-border-radius-lg`)};`);
    lines.push(`  padding: ${ref(`${brand}-semantic-spacing-md`)};`);
    lines.push(`  background-color: ${ref(`${brand}-semantic-color-surface-base`)};`);
    lines.push(`  transition: background-color ${ref(`${brand}-semantic-duration-fast`)} ease;`);
    lines.push('}');
    lines.push(`.card-interactive:hover { background-color: ${ref(`${brand}-semantic-color-surface-sunken`)}; }`);

    lines.push('');
    lines.push('/* ===== COMPONENTS — Tables ===== */');
    lines.push(`.table { width: 100%; font-size: ${ref(`${brand}-semantic-typography-size-sm`)}; border-collapse: collapse; }`);
    lines.push(`.table th, .table td { border: 1px solid ${ref(`${brand}-semantic-color-border`)}; padding: ${ref(`${brand}-semantic-spacing-2`)}; }`);
    lines.push(`.table th { background-color: ${ref(`${brand}-semantic-color-surface-sunken`)}; text-align: left; font-weight: ${ref(`${brand}-primitive-fontWeight-semibold`)}; }`);
    lines.push('.table th.text-center, .table td.text-center { text-align: center; }');

    lines.push('');
    lines.push('/* ===== COMPONENTS — Toggle Button ===== */');
    lines.push(`.toggle-btn {`);
    lines.push(`  width: 2rem; height: 2rem;`);
    lines.push(`  border-radius: ${ref(`${brand}-semantic-border-radius-sm`)};`);
    lines.push(`  font-size: ${ref(`${brand}-semantic-typography-size-sm`)};`);
    lines.push(`  font-weight: ${ref(`${brand}-primitive-fontWeight-medium`)};`);
    lines.push(`  transition: background-color ${ref(`${brand}-semantic-duration-fast`)} ease, color ${ref(`${brand}-semantic-duration-fast`)} ease;`);
    lines.push('  display: inline-flex; align-items: center; justify-content: center;');
    lines.push('}');
    lines.push(`.toggle-btn-on { background-color: ${ref(`${brand}-semantic-color-action-primary`)}; color: ${ref(`${brand}-semantic-color-text-on-brand`)}; }`);
    lines.push(`.toggle-btn-off { background-color: ${ref(`${brand}-primitive-color-neutral-200`)}; color: ${ref(`${brand}-primitive-color-neutral-400`)}; }`);
    lines.push(`.toggle-btn-off:hover { background-color: ${ref(`${brand}-primitive-color-neutral-300`)}; }`);

    lines.push('');
    lines.push('/* ===== TRANSITIONS ===== */');
    lines.push(`.transition-colors { transition: background-color ${ref(`${brand}-semantic-duration-fast`)} ease, color ${ref(`${brand}-semantic-duration-fast`)} ease, border-color ${ref(`${brand}-semantic-duration-fast`)} ease; }`);

    lines.push('');
    lines.push('/* ===== INTERACTIVE STATES ===== */');
    lines.push('.disabled\\:opacity-50:disabled { opacity: 0.5; }');
    lines.push('.disabled\\:opacity-25:disabled { opacity: 0.25; }');
    lines.push('.disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }');
    lines.push(`.focus-ring:focus { outline: none; border-color: ${ref(`${brand}-semantic-color-action-primary`)}; box-shadow: 0 0 0 2px color-mix(in srgb, ${ref(`${brand}-semantic-color-action-primary`)} 30%, transparent); }`);

    // ============= RESPONSIVE BREAKPOINTS =============
    lines.push('');
    lines.push('/* ===== RESPONSIVE ===== */');

    const breakpoints: Record<string, string> = {};
    for (const bp of ['sm', 'md', 'lg', 'xl']) {
      const tokenName = `${brand}-semantic-breakpoint-${bp}`;
      if (tokensByPath.has(tokenName)) {
        const token = tokensByPath.get(tokenName);
        breakpoints[bp] = token.$value ?? token.value;
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
    return lines.join('\n') + '\n';
  },
});
