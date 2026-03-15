import StyleDictionary from 'style-dictionary';

/**
 * Generates utilities.css — pure CSS utilities with no token references.
 * Covers: layout, text utilities, interactive states.
 *
 * These classes get the plain `cl-dlite-` prefix (no tier infix) because
 * they are neither primitive-token nor semantic-token classes.
 */
StyleDictionary.registerFormat({
  name: 'css/utilities',
  format: () => {
    const lines: string[] = [
      '/**',
      ' * Do not edit directly, this file was auto-generated.',
      ' */',
      '',
    ];

    // ───────────────────────────── LAYOUT ─────────────────────────────
    lines.push('/* ===== LAYOUT ===== */');
    const layout: Record<string, string> = {
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
      'min-h-screen': 'min-height: 100vh',
      'mx-auto': 'margin-left: auto; margin-right: auto',
      'cursor-pointer': 'cursor: pointer',
      'cursor-not-allowed': 'cursor: not-allowed',
    };
    for (const [cls, val] of Object.entries(layout)) {
      lines.push(`.${cls} { ${val}; }`);
    }
    lines.push('');

    // ───────────────────────────── TEXT UTILITIES ─────────────────────
    lines.push('/* ===== TEXT UTILITIES ===== */');
    lines.push('.text-left { text-align: left; }');
    lines.push('.text-center { text-align: center; }');
    lines.push('.text-right { text-align: right; }');
    lines.push('.underline { text-decoration: underline; }');
    lines.push('.line-through { text-decoration: line-through; }');
    lines.push('.no-underline { text-decoration: none; }');
    lines.push('.whitespace-nowrap { white-space: nowrap; }');
    lines.push('.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }');
    lines.push('');

    // ───────────────────────────── INTERACTIVE STATES ────────────────
    lines.push('/* ===== INTERACTIVE STATES ===== */');
    lines.push('.disabled-opacity-50:disabled { opacity: 0.5; }');
    lines.push('.disabled-opacity-25:disabled { opacity: 0.25; }');
    lines.push('.disabled-cursor-not-allowed:disabled { cursor: not-allowed; }');
    lines.push('');

    // Prefix post-processing — no tier infix, just cl-dlite-
    const raw = lines.join('\n') + '\n';
    return raw.replace(/(?<!\\)\.(?=[a-zA-Z\-])/g, `.cl-dlite-`);
  },
});
