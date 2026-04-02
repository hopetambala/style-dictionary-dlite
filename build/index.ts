import StyleDictionary from 'style-dictionary';
import fs from 'node:fs';
import path from 'node:path';
import type { TokenTree } from './types.ts';
import { loadTokenFiles, resolveExtends, extractTokens, discoverThemes } from './tokens.ts';
import './transforms/index.ts';
import './formats/index.ts';
import { webPlatform, reactNativePlatform } from './platform/index.ts';
import { generateManifest } from './manifest/index.ts';

console.log('Build started...');

fs.rmSync('dist', { recursive: true, force: true });

// Load global + brand files into one document, then resolve $extends
const doc: TokenTree = {
  ...loadTokenFiles('tokens/globals'),
  ...loadTokenFiles('tokens/brands'),
};

console.log('Resolving $extends references...');
const resolved = resolveExtends(doc, doc) as TokenTree;

const primitives = (resolved.primitive ?? {}) as TokenTree;

const brandNames = Object.keys(resolved)
  .filter((k) => k !== 'global' && k !== 'primitive' && k !== 'semantic')
  .sort();

// ── Web build (CSS per brand/theme/mode) ──
for (const brandName of brandNames) {
  const combos = discoverThemes(resolved[brandName] as TokenTree);
  combos.sort((a, b) => a.theme.localeCompare(b.theme) || a.mode.localeCompare(b.mode));

  for (const { theme, mode } of combos) {
    console.log(`\n==============================================`);
    console.log(`\nProcessing web: [${brandName}] [${theme}] [${mode}]`);

    const tokens = extractTokens(resolved, brandName, theme, mode, primitives);

    const sd = new StyleDictionary({
      tokens,
      usesDtcg: true,
      platforms: webPlatform(brandName, theme, mode),
    } as any);

    await sd.buildAllPlatforms();
  }
}

// ── React Native build (combined JS per brand/theme) ──
for (const brandName of brandNames) {
  const combos = discoverThemes(resolved[brandName] as TokenTree);
  combos.sort((a, b) => a.theme.localeCompare(b.theme) || a.mode.localeCompare(b.mode));

  // Group modes by theme
  const themeMap = new Map<string, string[]>();
  for (const { theme, mode } of combos) {
    if (!themeMap.has(theme)) themeMap.set(theme, []);
    themeMap.get(theme)!.push(mode);
  }

  for (const theme of Array.from(themeMap.keys()).sort()) {
    const modes = themeMap.get(theme)!.sort();
    console.log(`\n==============================================`);
    console.log(`\nProcessing react-native: [${brandName}] [${theme}]`);

    // Build each mode to a temp JSON file
    for (const mode of modes) {
      const tokens = extractTokens(resolved, brandName, theme, mode, primitives);

      const sd = new StyleDictionary({
        tokens,
        usesDtcg: true,
        platforms: reactNativePlatform(brandName, theme, mode),
      } as any);

      await sd.buildAllPlatforms();
    }

    // Read temp JSON files and write separate mode files + barrel index
    const tmpDir = `dist/rn/${brandName}/${theme}/.tmp`;
    const outDir = `dist/rn/${brandName}/${theme}`;

    for (const mode of modes) {
      const jsonPath = path.join(tmpDir, `${mode}.json`);
      const data = fs.readFileSync(jsonPath, 'utf-8');
      const capMode = mode.charAt(0).toUpperCase() + mode.slice(1);

      // .js
      fs.writeFileSync(
        path.join(outDir, `${mode}.js`),
        `export const ${mode} = ${data};\n`,
      );
      // .d.ts
      fs.writeFileSync(
        path.join(outDir, `${mode}.d.ts`),
        `export declare const ${mode}: ${data};\nexport type ${capMode}Tokens = typeof ${mode};\n`,
      );
    }

    // Barrel index
    const imports = modes.map((m) => `import { ${m} } from './${m}.js';`);
    const reExports = modes.map((m) => `export { ${m} } from './${m}.js';`);
    const modeNames = modes.join(', ');

    // index.js
    const indexJs = [
      ...imports,
      '',
      ...reExports,
      '',
      `export const tokens = { ${modeNames} };`,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(outDir, 'index.js'), indexJs);

    // index.d.ts
    const dtsReExports = modes.map((m) => `export { ${m} } from './${m}.js';`);
    const indexDts = [
      ...dtsReExports,
      '',
      `export declare const tokens: { ${modes.map((m) => `readonly ${m}: typeof import('./${m}.js').${m}`).join('; ')} };`,
      `export type Tokens = (typeof tokens)[keyof typeof tokens];`,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(outDir, 'index.d.ts'), indexDts);

    // Clean up temp files
    fs.rmSync(tmpDir, { recursive: true, force: true });

    for (const mode of modes) {
      console.log(`✔︎ dist/rn/${brandName}/${theme}/${mode}.js`);
    }
    console.log(`✔︎ dist/rn/${brandName}/${theme}/index.js`);
  }
}

console.log('\n==============================================');

// ── Font distribution for Kooky brand ──
console.log('\nHandling font distribution...');
const fontSourceDir = path.resolve('assets/fonts');
const fontBrandDir = 'dist/web/kooky/fonts'; // Shared brand-level fonts directory

if (resolved.kooky) {
  // Guard: ensure font assets exist before attempting to copy
  if (!fs.existsSync(fontSourceDir)) {
    throw new Error(
      `Kooky brand requires Recoleta font assets at ${fontSourceDir}, but directory does not exist.\n` +
      'Please ensure Recoleta fonts are present in assets/fonts/ (Regular, Bold, Black in ttf & woff2 formats).'
    );
  }

  // Copy fonts once to shared brand directory (deduplicated across themes)
  // Only include weights used in @font-face declarations: Regular (400), Bold (700), Black (900)
  fs.mkdirSync(fontBrandDir, { recursive: true });
  const fontFiles = fs.readdirSync(fontSourceDir)
    .filter(f => f.startsWith('Recoleta') && !f.includes('Medium'));
  for (const fontFile of fontFiles) {
    const src = path.join(fontSourceDir, fontFile);
    const dest = path.join(fontBrandDir, fontFile);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`✔︎ Copied font: ${fontFile} to ${fontBrandDir}`);
    }
  }

  const kookyThemes = discoverThemes(resolved.kooky as TokenTree)
    .map(combo => combo.theme)
    .filter((theme, idx, arr) => arr.indexOf(theme) === idx); // unique themes

  for (const theme of kookyThemes) {
    const fontDistDir = `dist/web/kooky/${theme}/fonts`;
    fs.mkdirSync(fontDistDir, { recursive: true });

    // Generate @font-face CSS with relative paths to shared brand-level fonts
    const fontFaceCSS = `/* Recoleta font faces for Kooky brand */
@font-face {
  font-family: 'Recoleta';
  src: url('../../fonts/Recoleta-Regular.woff2') format('woff2'),
       url('../../fonts/Recoleta-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Recoleta';
  src: url('../../fonts/Recoleta-Bold.woff2') format('woff2'),
       url('../../fonts/Recoleta-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: 'Recoleta';
  src: url('../../fonts/Recoleta-Black.woff2') format('woff2'),
       url('../../fonts/Recoleta-Black.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
}
`;
    fs.writeFileSync(path.join(fontDistDir, 'fonts.css'), fontFaceCSS);
    console.log(`✔︎ Generated: fonts.css for theme ${theme}`);
  }
}

console.log('\n==============================================');
console.log('\nBuild completed!');

// Generate preview manifest (brand/theme discovery for the preview app)
generateManifest();
