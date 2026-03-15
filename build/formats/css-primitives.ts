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
    return raw.replace(/(?<!\\)\.(?=[a-zA-Z\-])/g, `.cl-dlite-prim-`);
  },
});
