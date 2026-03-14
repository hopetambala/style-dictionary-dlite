import StyleDictionary from 'style-dictionary';
import fs from 'node:fs';
import path from 'node:path';
import type { TokenTree } from './types.ts';
import { loadTokenFiles, resolveExtends, extractTokens, discoverThemes } from './tokens.ts';
import './transforms/index.ts';
import './formats/index.ts';
import { webPlatform, reactNativePlatform } from './platform/index.ts';

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

const brandNames = Object.keys(resolved).filter(
  (k) => k !== 'global' && k !== 'primitive' && k !== 'semantic',
);

// ── Web build (CSS per brand/theme/mode) ──
for (const brandName of brandNames) {
  const combos = discoverThemes(resolved[brandName] as TokenTree);

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

// ── React Native build (combined TS per brand/theme) ──
for (const brandName of brandNames) {
  const combos = discoverThemes(resolved[brandName] as TokenTree);

  // Group modes by theme
  const themeMap = new Map<string, string[]>();
  for (const { theme, mode } of combos) {
    if (!themeMap.has(theme)) themeMap.set(theme, []);
    themeMap.get(theme)!.push(mode);
  }

  for (const [theme, modes] of themeMap) {
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
      const modeContent = `export const ${mode} = ${data} as const;\n\nexport type ${mode.charAt(0).toUpperCase() + mode.slice(1)}Tokens = typeof ${mode};\n`;
      fs.writeFileSync(path.join(outDir, `${mode}.ts`), modeContent);
    }

    // Barrel index
    const imports = modes.map((m) => `import { ${m} } from './${m}.ts';`);
    const reExports = modes.map((m) => `export { ${m} } from './${m}.ts';`);
    const modeNames = modes.join(', ');
    const indexContent = [
      ...imports,
      '',
      ...reExports,
      '',
      `export const tokens = { ${modeNames} } as const;`,
      `export type Tokens = typeof ${modes[0]};`,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(outDir, 'index.ts'), indexContent);

    // Clean up temp files
    fs.rmSync(tmpDir, { recursive: true, force: true });

    for (const mode of modes) {
      console.log(`✔︎ dist/rn/${brandName}/${theme}/${mode}.ts`);
    }
    console.log(`✔︎ dist/rn/${brandName}/${theme}/index.ts`);
  }
}

console.log('\n==============================================');
console.log('\nBuild completed!');
