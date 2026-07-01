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

type FontFormat = {
  extension: 'woff2' | 'ttf';
  format: 'woff2' | 'truetype';
};

type FontFace = {
  suffix: string;
  weight: number;
  style: 'normal' | 'italic';
};

type BrandFontConfig = {
  family: string;
  filePrefix: string;
  formats: FontFormat[];
  faces: FontFace[];
};

const BRAND_FONT_CONFIGS: Record<string, BrandFontConfig[]> = {
  kooky: [
    {
      family: 'Recoleta',
      filePrefix: 'Recoleta',
      formats: [
        { extension: 'woff2', format: 'woff2' },
        { extension: 'ttf', format: 'truetype' },
      ],
      faces: [
        { suffix: 'Regular', weight: 400, style: 'normal' },
        { suffix: 'Medium', weight: 500, style: 'normal' },
        { suffix: 'Bold', weight: 700, style: 'normal' },
        { suffix: 'Black', weight: 900, style: 'normal' },
      ],
    },
  ],
  puente: [
    {
      family: 'Plus Jakarta Sans',
      filePrefix: 'PlusJakartaSans',
      formats: [
        { extension: 'woff2', format: 'woff2' },
      ],
      faces: [
        { suffix: 'Regular', weight: 400, style: 'normal' },
        { suffix: 'Bold', weight: 700, style: 'normal' },
      ],
    },
  ],
  survivor: [
    {
      family: 'Fraunces',
      filePrefix: 'Fraunces',
      formats: [
        { extension: 'woff2', format: 'woff2' },
      ],
      faces: [
        { suffix: 'Regular', weight: 400, style: 'normal' },
        { suffix: 'Bold', weight: 700, style: 'normal' },
      ],
    },
  ],
  sneaks: [
    {
      family: 'Space Grotesk',
      filePrefix: 'SpaceGrotesk',
      formats: [
        { extension: 'woff2', format: 'woff2' },
      ],
      faces: [
        { suffix: 'Medium', weight: 500, style: 'normal' },
        { suffix: 'SemiBold', weight: 600, style: 'normal' },
        { suffix: 'Bold', weight: 700, style: 'normal' },
      ],
    },
    {
      family: 'Inter',
      filePrefix: 'Inter',
      formats: [
        { extension: 'woff2', format: 'woff2' },
      ],
      faces: [
        { suffix: 'Regular', weight: 400, style: 'normal' },
        { suffix: 'Bold', weight: 700, style: 'normal' },
      ],
    },
  ],
};

function expectedFontFiles(config: BrandFontConfig): string[] {
  return config.faces.flatMap((face) =>
    config.formats.map((fontFormat) => `${config.filePrefix}-${face.suffix}.${fontFormat.extension}`),
  );
}

function buildFontFaceCss(config: BrandFontConfig): string {
  const blocks = config.faces.map((face) => {
    const src = config.formats
      .map(
        (fontFormat) =>
          `url('../../fonts/${config.filePrefix}-${face.suffix}.${fontFormat.extension}') format('${fontFormat.format}')`,
      )
      .join(',\n       ');

    return `@font-face {
  font-family: '${config.family}';
  src: ${src};
  font-weight: ${face.weight};
  font-style: ${face.style};
}`;
  });

  return `/* ${config.family} font faces */\n${blocks.join('\n\n')}\n`;
}

// ── Font distribution for configured web brands ──
console.log('\nHandling font distribution...');
const fontSourceDir = path.resolve('assets/fonts');

// Only require assets/fonts if at least one font-packaged brand is being built
const builtFontBrands = Object.keys(BRAND_FONT_CONFIGS).filter((b) => resolved[b]);
if (builtFontBrands.length > 0 && !fs.existsSync(fontSourceDir)) {
  throw new Error(
    `Font packaging requires assets at ${fontSourceDir}, but directory does not exist.\n` +
      'Please add the configured brand font files in assets/fonts/.',
  );
}

for (const [brandName, fontConfigs] of Object.entries(BRAND_FONT_CONFIGS)) {
  if (!resolved[brandName]) continue;

  const requiredFiles = fontConfigs.flatMap(expectedFontFiles);
  const missingFiles = requiredFiles.filter((fileName) => !fs.existsSync(path.join(fontSourceDir, fileName)));
  if (missingFiles.length > 0) {
    throw new Error(
      `${brandName} requires missing font assets in assets/fonts/:\n- ${missingFiles.join('\n- ')}`,
    );
  }

  const fontBrandDir = `dist/web/${brandName}/fonts`;
  fs.mkdirSync(fontBrandDir, { recursive: true });

  for (const fontFile of requiredFiles) {
    const src = path.join(fontSourceDir, fontFile);
    const dest = path.join(fontBrandDir, fontFile);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`✔︎ Copied font: ${fontFile} to ${fontBrandDir}`);
    }
  }

  const themes = [...new Set(discoverThemes(resolved[brandName] as TokenTree).map((combo) => combo.theme))];
  const fontFaceCss = fontConfigs.map(buildFontFaceCss).join('\n');

  for (const theme of themes) {
    const fontDistDir = `dist/web/${brandName}/${theme}/fonts`;
    fs.mkdirSync(fontDistDir, { recursive: true });
    fs.writeFileSync(path.join(fontDistDir, 'fonts.css'), fontFaceCss);
    console.log(`✔︎ Generated: dist/web/${brandName}/${theme}/fonts/fonts.css`);
  }
}

console.log('\n==============================================');
console.log('\nBuild completed!');

// Generate preview manifest (brand/theme discovery for the preview app)
generateManifest();
