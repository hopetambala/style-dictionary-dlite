import StyleDictionary from 'style-dictionary';
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TokenNode = Record<string, unknown> & { $value: unknown };

type TokenTree = {
  [key: string]: unknown;
};

// ---------------------------------------------------------------------------
// W3C DTCG $extends resolver (spec section 6.4)
//   Deep merge: inherited tokens are copied, local tokens override at same path
//   Token nodes ($value present) are replaced entirely, not property-merged
// ---------------------------------------------------------------------------
function isToken(obj: unknown): obj is TokenNode {
  return obj != null && typeof obj === 'object' && '$value' in obj;
}

function deepMerge(target: TokenTree, source: TokenTree): TokenTree {
  const result: TokenTree = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (isToken(srcVal)) {
      result[key] = srcVal;
    } else if (
      srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal) &&
      tgtVal && typeof tgtVal === 'object' && !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(tgtVal as TokenTree, srcVal as TokenTree);
    } else {
      result[key] = srcVal;
    }
  }
  return result;
}

function resolveReference(doc: TokenTree, refString: string): unknown {
  const segments = refString.replace(/^\{/, '').replace(/\}$/, '').split('.');
  let current: unknown = doc;
  for (const seg of segments) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[seg];
    } else {
      throw new Error(`Cannot resolve $extends reference: ${refString}`);
    }
  }
  return current;
}

function resolveExtends(node: unknown, root: TokenTree): unknown {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return node;

  let result: TokenTree = { ...(node as TokenTree) };

  if (result.$extends) {
    const rawBase = resolveReference(root, result.$extends as string);
    const resolvedBase = resolveExtends(structuredClone(rawBase), root);
    delete result.$extends;
    result = deepMerge(resolvedBase as TokenTree, result);
  }

  for (const key of Object.keys(result)) {
    if (key.startsWith('$')) continue;
    const child = result[key];
    if (child && typeof child === 'object' && !Array.isArray(child) && !isToken(child)) {
      result[key] = resolveExtends(child, root);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Load all token files into a single document, resolve $extends
// ---------------------------------------------------------------------------
function loadTokenFiles(dir: string): TokenTree {
  const doc: TokenTree = {};
  if (!fs.existsSync(dir)) return doc;
  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.tokens.json'))
    .sort();
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
    Object.assign(doc, content);
  }
  return doc;
}

// ---------------------------------------------------------------------------
// Apply inline mode overrides from $extensions.mode on each token
//   Walks the token tree; for any token with $extensions.mode[mode],
//   replaces $value with the mode-specific value and strips the metadata
// ---------------------------------------------------------------------------
function applyInlineModes(node: unknown, mode: string): unknown {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return node;

  const result: TokenTree = {};
  for (const [key, val] of Object.entries(node as TokenTree)) {
    if (isToken(val)) {
      const extensions = val.$extensions as Record<string, Record<string, unknown>> | undefined;
      const modeValue = extensions?.mode?.[mode];
      if (modeValue != null) {
        const clone: TokenTree = { ...val, $value: modeValue };
        // Strip the mode metadata from $extensions
        if (clone.$extensions) {
          const { mode: _, ...restExt } = clone.$extensions as Record<string, unknown>;
          if (Object.keys(restExt).length === 0) {
            delete clone.$extensions;
          } else {
            clone.$extensions = restExt;
          }
        }
        result[key] = clone;
      } else {
        result[key] = val;
      }
    } else if (key.startsWith('$')) {
      result[key] = val;
    } else if (typeof val === 'object') {
      result[key] = applyInlineModes(val, mode);
    } else {
      result[key] = val;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Extract tokens for a brand + theme + mode
//   1. Start with the resolved brand (global + brand overrides via $extends)
//   2. Apply inline $extensions.mode overrides for the current mode
//   3. Deep merge brand themes[theme].modes[mode] overrides
//   4. Strip "themes" group — it's metadata, not output tokens
// ---------------------------------------------------------------------------
function extractTokens(
  resolved: TokenTree,
  brandName: string,
  theme: string,
  mode: string,
  primitives: TokenTree,
): TokenTree {
  const brand = resolved[brandName] as TokenTree | undefined;
  if (!brand) throw new Error(`Brand "${brandName}" not found`);

  // Clone base brand tokens (already has global tokens merged via $extends)
  const base = structuredClone(brand) as TokenTree;

  // Get brand theme+mode overrides
  const themes = base.themes as TokenTree | undefined;
  const brandModeOverrides = (
    (themes?.[theme] as TokenTree | undefined)?.modes as TokenTree | undefined
  )?.[mode] as TokenTree ?? {};

  // Remove structural groups — not part of output
  delete base.themes;
  delete base.modes;

  // Apply inline mode values from $extensions.mode
  const modeApplied = applyInlineModes(base, mode) as TokenTree;

  // Layer brand theme+mode overrides on top
  const merged = deepMerge(modeApplied, brandModeOverrides);

  // Include primitives so alias references like {primitive.blue.500} resolve
  return { primitive: structuredClone(primitives), ...merged };
}

// ---------------------------------------------------------------------------
// Discover all theme + mode combinations for a brand
//   Brands have: themes > modes (e.g. themes.default.modes.light)
// ---------------------------------------------------------------------------
interface ThemeCombo {
  theme: string;
  mode: string;
}

function discoverThemes(brand: TokenTree): ThemeCombo[] {
  const combos: ThemeCombo[] = [];
  const themes = (brand.themes ?? {}) as TokenTree;
  for (const [theme, themeValue] of Object.entries(themes)) {
    const modes = ((themeValue as TokenTree).modes ?? {}) as TokenTree;
    for (const mode of Object.keys(modes)) {
      combos.push({ theme, mode });
    }
  }
  return combos;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
console.log('Build started...');

// Clean dist folder
fs.rmSync('dist', { recursive: true, force: true });

// Register a custom name transform: brand-(primitive|semantic)-category-token
StyleDictionary.registerTransform({
  name: 'name/brand-tier-kebab',
  type: 'name',
  transform: (token: any, options: any) => {
    const brand = options.brandName;
    const tokenPath: string[] = token.path;
    const isPrimitive = tokenPath[0] === 'primitive';
    const tier = isPrimitive ? 'primitive' : 'semantic';
    // For primitives, skip the first "primitive" segment to avoid duplication
    const segments = isPrimitive ? tokenPath.slice(1) : tokenPath;
    return [brand, tier, ...segments].join('-');
  },
});

// Register a value transform for the DTCG 2025.10 color object format
// Converts { colorSpace, components, hex } → CSS hex string (via fallback)
StyleDictionary.registerTransform({
  name: 'value/dtcg-color',
  type: 'value',
  transitive: true,
  filter: (token: any) => token.$type === 'color',
  transform: (token: any) => {
    const val = token.$value ?? token.value;
    if (val && typeof val === 'object' && val.colorSpace && val.components) {
      // Use hex fallback if available, otherwise compute from sRGB components
      if (val.hex) return val.hex;
      const [r, g, b] = val.components;
      const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    return val;
  },
});

// Register a value transform for shadow tokens → CSS box-shadow string
StyleDictionary.registerTransform({
  name: 'value/shadow-css',
  type: 'value',
  transitive: true,
  filter: (token: any) => token.$type === 'shadow',
  transform: (token: any) => {
    const val = token.$value ?? token.value;
    if (val && typeof val === 'object' && val.offsetX !== undefined) {
      return `${val.offsetX} ${val.offsetY} ${val.blur} ${val.spread} ${val.color}`;
    }
    return val;
  },
});

// Load global + brand files into one document, then resolve $extends
const doc: TokenTree = {
  ...loadTokenFiles('tokens/globals'),
  ...loadTokenFiles('tokens/brands'),
};

console.log('Resolving $extends references...');
const resolved = resolveExtends(doc, doc) as TokenTree;

// Primitives are shared across all brands for alias resolution
const primitives = (resolved.primitive ?? {}) as TokenTree;

// Discover brands (everything except "global" and "primitive")
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
      platforms: {
        web: {
          brandName,
          transforms: ['attribute/cti', 'value/dtcg-color', 'value/shadow-css', 'name/brand-tier-kebab'],
          buildPath: `dist/web/${brandName}/${theme}/`,
          files: [
            {
              destination: mode === 'light' ? 'variables.css' : `variables.${mode}.css`,
              format: 'css/variables',
            },
          ],
        },
      },
    } as any);

    await sd.buildAllPlatforms();
  }
}

console.log('\n==============================================');
console.log('\nBuild completed!');
