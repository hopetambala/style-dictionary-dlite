import StyleDictionary from 'style-dictionary';

/**
 * Generates primitives.css — foundational CSS utilities + primitive token classes.
 * Covers: layout, sizing, text utilities, font weights, letter spacing, opacity,
 * and primitive color classes (text/bg/border for every hue-step).
 */
StyleDictionary.registerFormat({
  name: 'css/primitives',
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

    // ───────────────────────────── SIZING ─────────────────────────────
    lines.push('/* ===== SIZING ===== */');
    const widths: Record<string, string> = {
      '6': '1.5rem', '8': '2rem', '12': '3rem', '16': '4rem',
      '20': '5rem', '24': '6rem', '28': '7rem',
    };
    for (const [n, v] of Object.entries(widths)) {
      lines.push(`.w-${n} { width: ${v}; }`);
      lines.push(`.h-${n} { height: ${v}; }`);
    }
    const minWidths: Record<string, string> = { '20': '5rem', '48': '12rem' };
    for (const [n, v] of Object.entries(minWidths)) {
      lines.push(`.min-w-${n} { min-width: ${v}; }`);
    }
    const maxWidths: Record<string, string> = {
      'xs': '20rem', 'sm': '24rem', 'lg': '32rem',
      'xxl': '42rem', 'xxxxl': '56rem', 'xxxxxxxl': '80rem',
    };
    for (const [n, v] of Object.entries(maxWidths)) {
      lines.push(`.max-w-${n} { max-width: ${v}; }`);
    }
    for (const n of [2, 3, 4]) {
      lines.push(`.grid-cols-${n} { grid-template-columns: repeat(${n}, minmax(0, 1fr)); }`);
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

    // ───────────────────────────── FONT WEIGHTS ──────────────────────
    lines.push('/* ===== FONT WEIGHTS ===== */');
    const weights: Record<string, string> = {
      'normal': 'regular', 'medium': 'medium', 'semibold': 'semibold', 'bold': 'bold',
    };
    for (const [cls, tok] of Object.entries(weights)) {
      lines.push(`.font-${cls} { font-weight: ${ref(`tk-dlite-primitive-fontWeight-${tok}`)}; }`);
    }
    lines.push('');

    // ───────────────────────────── LETTER SPACING ────────────────────
    lines.push('/* ===== LETTER SPACING ===== */');
    for (const name of ['tight', 'wide']) {
      lines.push(`.tracking-${name} { letter-spacing: ${ref(`tk-dlite-primitive-dimension-letter-spacing-${name}`)}; }`);
    }
    lines.push(`.tracking-widest { letter-spacing: ${ref(`tk-dlite-primitive-dimension-letter-spacing-widest`)}; }`);
    lines.push('');

    // ───────────────────────────── OPACITY ────────────────────────────
    lines.push('/* ===== OPACITY ===== */');
    const opacitySteps = ['0', '5', '10', '20', '40', '60', '80', '100'];
    for (const step of opacitySteps) {
      const tok = `tk-dlite-primitive-number-opacity-${step}`;
      if (has(tok)) {
        lines.push(`.opacity-${step} { opacity: ${ref(tok)}; }`);
      }
    }
    lines.push('');

    // ───────────────────────────── PRIMITIVE COLORS ──────────────────
    lines.push('/* ===== PRIMITIVE COLORS ===== */');

    // White & black
    lines.push(`.text-white { color: ${ref(`tk-dlite-primitive-color-white`)}; }`);
    lines.push(`.bg-white { background-color: ${ref(`tk-dlite-primitive-color-white`)}; }`);
    lines.push(`.text-black { color: ${ref(`tk-dlite-primitive-color-black`)}; }`);
    lines.push(`.bg-black { background-color: ${ref(`tk-dlite-primitive-color-black`)}; }`);
    lines.push('');

    const hues = ['neutral', 'blue', 'green', 'yellow', 'orange', 'red', 'mint', 'teal', 'purple', 'pink'];
    const steps = ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'];
    const alias: Record<string, string> = { 'neutral': 'gray' };

    for (const hue of hues) {
      const cls = alias[hue] || hue;
      lines.push(`/* -- ${cls} -- */`);
      for (const step of steps) {
        const tok = `tk-dlite-primitive-color-${hue}-${step}`;
        if (has(tok)) {
          lines.push(`.text-${cls}-${step} { color: ${ref(tok)}; }`);
          lines.push(`.bg-${cls}-${step} { background-color: ${ref(tok)}; }`);
          lines.push(`.border-${cls}-${step} { border-color: ${ref(tok)}; }`);
        }
      }
    }
    lines.push('');

    // Brand-prefix post-processing
    const raw = lines.join('\n') + '\n';
    return raw.replace(/(?<!\\)\.(?=[a-zA-Z\-])/g, `.cl-dlite-`);
  },
});
