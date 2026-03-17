import StyleDictionary from 'style-dictionary';

/**
 * Generates components.css — compound component classes built on semantic tokens.
 * Covers: buttons, inputs, badges, cards, tables, toggle buttons.
 */
StyleDictionary.registerFormat({
  name: 'css/components',
  format: ({ dictionary, options }: any) => {
    const lines: string[] = [
      '/**',
      ' * Do not edit directly, this file was auto-generated.',
      ' */',
      '',
    ];

    const ref = (n: string) => `var(--${n})`;

    // Shorthand helpers for common token paths
    const color = (n: string) => ref(`tk-dlite-semantic-color-${n}`);
    const spacing = (n: string) => ref(`tk-dlite-semantic-spacing-${n}`);
    const radius = (n: string) => ref(`tk-dlite-semantic-border-radius-${n}`);
    const size = (n: string) => ref(`tk-dlite-semantic-typography-size-${n}`);
    const weight = (n: string) => ref(`tk-dlite-primitive-fontWeight-${n}`);
    const prim = (n: string) => ref(`tk-dlite-primitive-color-${n}`);
    const dur = (n: string) => ref(`tk-dlite-semantic-duration-${n}`);

    // ───────────────────────────── BUTTONS ────────────────────────────
    lines.push('/* ===== BUTTONS ===== */');
    lines.push('.btn {');
    lines.push('  display: inline-flex; align-items: center; justify-content: center;');
    lines.push(`  font-weight: ${weight('medium')};`);
    lines.push(`  border-radius: ${radius('lg')};`);
    lines.push(`  padding: ${spacing('200')} ${spacing('400')};`);
    lines.push(`  transition: background-color ${dur('fast')} ease, color ${dur('fast')} ease, opacity ${dur('fast')} ease;`);
    lines.push('  cursor: pointer; white-space: nowrap;');
    lines.push('}');
    lines.push('.btn:disabled { opacity: 0.5; cursor: not-allowed; }');

    lines.push(`.btn-primary { background-color: ${color('action-primary')}; color: ${color('text-on-primary')}; }`);
    lines.push(`.btn-primary:not(:disabled):active { background-color: ${color('action-primary-active')}; }`);

    lines.push(`.btn-success { background-color: ${color('feedback-success')}; color: ${color('text-on-primary')}; }`);
    lines.push(`.btn-success:not(:disabled):active { background-color: ${color('feedback-success-active')}; }`);

    lines.push(`.btn-danger { background-color: ${color('feedback-danger')}; color: ${color('text-on-primary')}; }`);;
    lines.push(`.btn-danger:not(:disabled):active { background-color: ${color('feedback-danger-active')}; }`);

    lines.push(`.btn-secondary { background-color: ${color('action-secondary')}; color: ${color('text-primary')}; }`);
    lines.push(`.btn-secondary:not(:disabled):active { background-color: ${color('action-secondary-active')}; }`);

    lines.push(`.btn-sm { font-size: ${size('300')}; padding: ${spacing('100')} ${spacing('300')}; }`);
    lines.push(`.btn-lg { padding: ${spacing('300')} ${spacing('600')}; }`);
    lines.push('.btn-link { background: none; padding: 0; text-decoration: underline; }');
    lines.push('');

    // ───────────────────────────── INPUTS ─────────────────────────────
    lines.push('/* ===== INPUTS ===== */');
    lines.push('.input {');
    lines.push(`  border: 1px solid ${color('border')};`);
    lines.push(`  border-radius: ${radius('lg')};`);
    lines.push(`  padding: ${spacing('200')} ${spacing('300')};`);
    lines.push(`  background-color: ${color('surface-base')};`);
    lines.push(`  color: ${color('text-primary')};`);
    lines.push('  width: 100%;');
    lines.push(`  transition: border-color ${dur('fast')} ease, box-shadow ${dur('fast')} ease;`);
    lines.push('}');
    lines.push(`.input:focus { outline: none; border-color: ${color('action-primary')}; box-shadow: 0 0 0 2px color-mix(in srgb, ${color('action-primary')} 30%, transparent); }`);
    lines.push(`.input-lg { padding: ${spacing('300')} ${spacing('400')}; }`);
    lines.push('');

    // ───────────────────────────── BADGES ─────────────────────────────
    lines.push('/* ===== BADGES ===== */');
    lines.push('.badge {');
    lines.push('  display: inline-flex; align-items: center;');
    lines.push(`  font-size: ${size('200')};`);
    lines.push(`  font-weight: ${weight('medium')};`);
    lines.push(`  padding: ${spacing('xxs')} ${spacing('200')};`);
    lines.push(`  border-radius: ${radius('full')};`);
    lines.push('}');
    const badges: Record<string, [string, string]> = {
      'success': ['green-200', 'green-800'],
      'warning': ['yellow-200', 'yellow-800'],
      'danger': ['red-200', 'red-800'],
      'neutral': ['neutral-200', 'neutral-600'],
      'info': ['blue-200', 'blue-800'],
    };
    for (const [variant, [bg, fg]] of Object.entries(badges)) {
      lines.push(`.badge-${variant} { background-color: ${prim(bg)}; color: ${prim(fg)}; }`);
    }
    lines.push('');

    // ───────────────────────────── CARDS ──────────────────────────────
    lines.push('/* ===== CARDS ===== */');
    lines.push('.card {');
    lines.push(`  border: 1px solid ${color('border')};`);
    lines.push(`  border-radius: ${radius('lg')};`);
    lines.push(`  padding: ${spacing('md')};`);
    lines.push(`  background-color: ${color('surface-base')};`);
    lines.push(`  transition: background-color ${dur('fast')} ease;`);
    lines.push('}');
    lines.push('');

    // ───────────────────────────── TABLES ─────────────────────────────
    lines.push('/* ===== TABLES ===== */');
    lines.push(`.table { width: 100%; font-size: ${size('300')}; border-collapse: collapse; }`);
    lines.push(`.table th, .table td { border: 1px solid ${color('border')}; padding: ${spacing('200')}; }`);
    lines.push(`.table th { background-color: ${color('surface-sunken')}; text-align: left; font-weight: ${weight('semibold')}; }`);
    lines.push('.table th.text-center, .table td.text-center { text-align: center; }');
    lines.push('');

    // ───────────────────────────── TOGGLE BUTTONS ────────────────────
    lines.push('/* ===== TOGGLE BUTTONS ===== */');
    lines.push('.toggle-btn {');
    lines.push('  width: 2rem; height: 2rem;');
    lines.push(`  border-radius: ${radius('sm')};`);
    lines.push(`  font-size: ${size('300')};`);
    lines.push(`  font-weight: ${weight('medium')};`);
    lines.push(`  transition: background-color ${dur('fast')} ease, color ${dur('fast')} ease;`);
    lines.push('  display: inline-flex; align-items: center; justify-content: center;');
    lines.push('}');
    lines.push(`.toggle-btn-on { background-color: ${color('action-primary')}; color: ${color('text-on-primary')}; }`);
    lines.push(`.toggle-btn-off { background-color: ${prim('neutral-200')}; color: ${prim('neutral-400')}; }`);
    lines.push('');

    // Brand-prefix post-processing
    const raw = lines.join('\n') + '\n';
    return raw.replace(/(?<!\\)\.(?=[a-zA-Z\-])/g, `.cl-dlite-`);
  },
});
