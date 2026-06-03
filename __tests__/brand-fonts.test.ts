import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const DIST_WEB = path.resolve('dist/web');
const DIST_RN = path.resolve('dist/rn');

/**
 * Brand → heading font mapping contract:
 *   Kooky    → Recoleta
 *   Puente   → Plus Jakarta Sans
 *   Survivor → Fraunces
 */
const BRAND_HEADING_FONTS: Record<string, string> = {
  kooky: 'Recoleta',
  puente: 'Plus Jakarta Sans',
  survivor: 'Fraunces',
};

/**
 * Brand → body font mapping contract:
 *   Kooky    → Recoleta  (same as heading)
 *   Puente   → Source Serif 4  (global default)
 *   Survivor → Source Serif 4  (global default)
 */
const BRAND_BODY_FONTS: Record<string, string> = {
  kooky: 'Recoleta',
  puente: 'Source Serif 4',
  survivor: 'Source Serif 4',
};

beforeAll(() => {
  if (!fs.existsSync(DIST_WEB) || !fs.existsSync(DIST_RN)) {
    throw new Error('dist/ not found. Run `npm run build` first.');
  }
});

// ── Helper: read a CSS file and extract a custom property value ──
function extractCSSVar(cssText: string, varName: string): string | undefined {
  const re = new RegExp(`${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*([^;]+)`);
  const m = cssText.match(re);
  return m ? m[1].trim() : undefined;
}

// ── Helper: extract a JS export value ──
function extractJSTokenValue(jsText: string, tokenKey: string): string | undefined {
  const re = new RegExp(`"${tokenKey}":\\s*"([^"]+)"`);
  const m = jsText.match(re);
  return m ? m[1] : undefined;
}

// ────────────────────────────────────────────────
// 1. Web CSS variable resolves correctly per brand/theme
// ────────────────────────────────────────────────
describe('Web: heading font CSS variable', () => {
  for (const [brand, expectedFont] of Object.entries(BRAND_HEADING_FONTS)) {
    const brandDir = path.join(DIST_WEB, brand);
    if (!fs.existsSync(brandDir)) continue;

    const themes = fs.readdirSync(brandDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const theme of themes) {
      for (const variant of ['variables.css', 'variables.dark.css']) {
        const filePath = path.join(brandDir, theme, variant);
        if (!fs.existsSync(filePath)) continue;

        test(`${brand}/${theme}/${variant} heading is "${expectedFont}"`, () => {
          const css = fs.readFileSync(filePath, 'utf-8');
          const value = extractCSSVar(css, '--tk-dlite-semantic-typography-font-heading');
          expect(value).toBe(expectedFont);
        });
      }
    }
  }
});

// ────────────────────────────────────────────────
// 1b. Web body font CSS variable resolves correctly per brand/theme
// ────────────────────────────────────────────────
describe('Web: body font CSS variable', () => {
  for (const [brand, expectedFont] of Object.entries(BRAND_BODY_FONTS)) {
    const brandDir = path.join(DIST_WEB, brand);
    if (!fs.existsSync(brandDir)) continue;

    const themes = fs.readdirSync(brandDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const theme of themes) {
      for (const variant of ['variables.css', 'variables.dark.css']) {
        const filePath = path.join(brandDir, theme, variant);
        if (!fs.existsSync(filePath)) continue;

        test(`${brand}/${theme}/${variant} body font is "${expectedFont}"`, () => {
          const css = fs.readFileSync(filePath, 'utf-8');
          const value = extractCSSVar(css, '--tk-dlite-semantic-typography-font-body');
          expect(value).toBe(expectedFont);
        });
      }
    }
  }
});

// ────────────────────────────────────────────────
// 2. Web @font-face declarations match the brand's heading font
// ────────────────────────────────────────────────
describe('Web: @font-face declarations', () => {
  for (const [brand, expectedFont] of Object.entries(BRAND_HEADING_FONTS)) {
    const brandDir = path.join(DIST_WEB, brand);
    if (!fs.existsSync(brandDir)) continue;

    const themes = fs.readdirSync(brandDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const theme of themes) {
      const fontsCss = path.join(brandDir, theme, 'fonts', 'fonts.css');
      if (!fs.existsSync(fontsCss)) continue;

      test(`${brand}/${theme}/fonts/fonts.css declares "${expectedFont}"`, () => {
        const css = fs.readFileSync(fontsCss, 'utf-8');
        expect(css).toContain(`font-family: '${expectedFont}'`);
        // Ensure it does NOT declare a different brand's heading font
        for (const [otherBrand, otherFont] of Object.entries(BRAND_HEADING_FONTS)) {
          if (otherBrand === brand) continue;
          expect(css).not.toContain(`font-family: '${otherFont}'`);
        }
      });
    }
  }
});

// ────────────────────────────────────────────────
// 3. Web font binary assets exist for each brand
// ────────────────────────────────────────────────
describe('Web: font asset files exist', () => {
  const BRAND_FONT_FILES: Record<string, string[]> = {
    kooky: [
      'Recoleta-Regular.woff2', 'Recoleta-Medium.woff2', 'Recoleta-Bold.woff2', 'Recoleta-Black.woff2',
      'Recoleta-Regular.ttf', 'Recoleta-Medium.ttf', 'Recoleta-Bold.ttf', 'Recoleta-Black.ttf',
    ],
    puente: [
      'PlusJakartaSans-Regular.woff2', 'PlusJakartaSans-Bold.woff2',
    ],
    survivor: [
      'Fraunces-Regular.woff2', 'Fraunces-Bold.woff2',
    ],
  };

  for (const [brand, files] of Object.entries(BRAND_FONT_FILES)) {
    const fontsDir = path.join(DIST_WEB, brand, 'fonts');

    for (const file of files) {
      test(`${brand}/fonts/${file} exists and is non-empty`, () => {
        const filePath = path.join(fontsDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
        const stat = fs.statSync(filePath);
        expect(stat.size).toBeGreaterThan(0);
      });
    }
  }
});

// ────────────────────────────────────────────────
// 3b. Kooky @font-face declares all four Recoleta weights
// ────────────────────────────────────────────────
describe('Web: Kooky Recoleta @font-face weights', () => {
  const EXPECTED_WEIGHTS = [400, 500, 700, 900];

  test('fonts.css declares all expected font-weight values', () => {
    const fontsCss = fs.readFileSync(
      path.join(DIST_WEB, 'kooky', 'default', 'fonts', 'fonts.css'),
      'utf-8',
    );
    for (const weight of EXPECTED_WEIGHTS) {
      expect(fontsCss).toContain(`font-weight: ${weight};`);
    }
  });
});

// ────────────────────────────────────────────────
// 4. Web reset.css imports fonts for every brand
// ────────────────────────────────────────────────
describe('Web: reset.css imports fonts', () => {
  for (const brand of Object.keys(BRAND_HEADING_FONTS)) {
    const brandDir = path.join(DIST_WEB, brand);
    if (!fs.existsSync(brandDir)) continue;

    const themes = fs.readdirSync(brandDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const theme of themes) {
      const resetPath = path.join(brandDir, theme, 'reset.css');
      if (!fs.existsSync(resetPath)) continue;

      test(`${brand}/${theme}/reset.css imports fonts.css`, () => {
        const css = fs.readFileSync(resetPath, 'utf-8');
        expect(css).toContain("@import './fonts/fonts.css'");
      });
    }
  }
});

// ────────────────────────────────────────────────
// 4b. .font-heading is a family-only utility (no font-weight)
// ────────────────────────────────────────────────
describe('Web: .font-heading does NOT set font-weight', () => {
  for (const brand of Object.keys(BRAND_HEADING_FONTS)) {
    const brandDir = path.join(DIST_WEB, brand);
    if (!fs.existsSync(brandDir)) continue;

    const themes = fs.readdirSync(brandDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const theme of themes) {
      const semPath = path.join(brandDir, theme, 'semantics.css');
      if (!fs.existsSync(semPath)) continue;

      test(`${brand}/${theme}/semantics.css .font-heading has no font-weight`, () => {
        const css = fs.readFileSync(semPath, 'utf-8');
        const rule = css.match(/font-heading\s*\{[^}]+\}/);
        expect(rule).not.toBeNull();
        expect(rule![0]).not.toContain('font-weight');
      });
    }
  }
});

// ────────────────────────────────────────────────
// 5. React Native token values resolve correctly per brand/theme
// ────────────────────────────────────────────────
describe('RN: heading font token value', () => {
  for (const [brand, expectedFont] of Object.entries(BRAND_HEADING_FONTS)) {
    const brandDir = path.join(DIST_RN, brand);
    if (!fs.existsSync(brandDir)) continue;

    const themes = fs.readdirSync(brandDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const theme of themes) {
      for (const mode of ['light', 'dark']) {
        const jsPath = path.join(brandDir, theme, `${mode}.js`);
        if (!fs.existsSync(jsPath)) continue;

        test(`rn/${brand}/${theme}/${mode}.js heading is "${expectedFont}"`, () => {
          const js = fs.readFileSync(jsPath, 'utf-8');
          const value = extractJSTokenValue(js, 'tkDliteSemanticTypographyFontHeading');
          expect(value).toBe(expectedFont);
        });
      }
    }
  }
});

// ────────────────────────────────────────────────
// 6. Source token files have correct heading font values
// ────────────────────────────────────────────────
describe('Source tokens: heading font values', () => {
  test('kooky tokens override heading to Recoleta', () => {
    const raw = JSON.parse(fs.readFileSync('tokens/brands/kooky.tokens.json', 'utf-8'));
    // Kooky can set it at brand or theme level — either is acceptable
    const brandLevel = raw.kooky?.typography?.['font-heading']?.['$value'];
    const themeLevel = raw.kooky?.themes?.default?.modes?.light?.typography?.['font-heading']?.['$value'];
    expect(brandLevel ?? themeLevel).toBe('Recoleta');
  });

  test('puente tokens set heading to Plus Jakarta Sans', () => {
    const raw = JSON.parse(fs.readFileSync('tokens/brands/puente.tokens.json', 'utf-8'));
    const brandLevel = raw.puente?.typography?.['font-heading']?.['$value'];
    const themeLevel = raw.puente?.themes?.default?.modes?.light?.typography?.['font-heading']?.['$value'];
    // Puente can also inherit from global — but explicit is preferred
    const globalRaw = JSON.parse(fs.readFileSync('tokens/globals/semantic.tokens.json', 'utf-8'));
    const globalDefault = globalRaw.semantic?.typography?.['font-heading']?.['$value'];
    const effective = brandLevel ?? themeLevel ?? globalDefault;
    expect(effective).toBe('Plus Jakarta Sans');
  });

  test('survivor tokens override heading to Fraunces', () => {
    const raw = JSON.parse(fs.readFileSync('tokens/brands/survivor.tokens.json', 'utf-8'));
    const brandLevel = raw.survivor?.typography?.['font-heading']?.['$value'];
    const themeLevel = raw.survivor?.themes?.default?.modes?.light?.typography?.['font-heading']?.['$value'];
    expect(brandLevel ?? themeLevel).toBe('Fraunces');
  });
});
