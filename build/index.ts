import StyleDictionary from 'style-dictionary';
import fs from 'node:fs';
import type { TokenTree } from './types.ts';
import { loadTokenFiles, resolveExtends, extractTokens, discoverThemes } from './tokens.ts';
import './transforms/index.ts';
import { webPlatform } from './platform/index.ts';

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

for (const brandName of brandNames) {
  const combos = discoverThemes(resolved[brandName] as TokenTree);

  for (const { theme, mode } of combos) {
    console.log(`\n==============================================`);
    console.log(`\nProcessing: [${brandName}] [${theme}] [${mode}]`);

    const tokens = extractTokens(resolved, brandName, theme, mode, primitives);

    const sd = new StyleDictionary({
      tokens,
      usesDtcg: true,
      platforms: webPlatform(brandName, theme, mode),
    } as any);

    await sd.buildAllPlatforms();
  }
}

console.log('\n==============================================');
console.log('\nBuild completed!');
