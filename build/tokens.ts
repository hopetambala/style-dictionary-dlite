import fs from 'node:fs';
import path from 'node:path';
import type { TokenNode, TokenTree, ThemeCombo } from './types.ts';

export function isToken(obj: unknown): obj is TokenNode {
  return obj != null && typeof obj === 'object' && '$value' in obj;
}

export function deepMerge(target: TokenTree, source: TokenTree): TokenTree {
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

export function resolveExtends(node: unknown, root: TokenTree): unknown {
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

export function loadTokenFiles(dir: string): TokenTree {
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

export function applyInlineModes(node: unknown, mode: string): unknown {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return node;

  const result: TokenTree = {};
  for (const [key, val] of Object.entries(node as TokenTree)) {
    if (isToken(val)) {
      const extensions = val.$extensions as Record<string, Record<string, unknown>> | undefined;
      const modeValue = extensions?.mode?.[mode];
      if (modeValue != null) {
        const clone: TokenTree = { ...val, $value: modeValue };
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

export function extractTokens(
  resolved: TokenTree,
  brandName: string,
  theme: string,
  mode: string,
  primitives: TokenTree,
): TokenTree {
  const brand = resolved[brandName] as TokenTree | undefined;
  if (!brand) throw new Error(`Brand "${brandName}" not found`);

  const base = structuredClone(brand) as TokenTree;

  const themes = base.themes as TokenTree | undefined;
  const brandModeOverrides = (
    (themes?.[theme] as TokenTree | undefined)?.modes as TokenTree | undefined
  )?.[mode] as TokenTree ?? {};

  delete base.themes;
  delete base.modes;

  const modeApplied = applyInlineModes(base, mode) as TokenTree;
  const merged = deepMerge(modeApplied, brandModeOverrides);

  return { primitive: structuredClone(primitives), ...merged };
}

export function discoverThemes(brand: TokenTree): ThemeCombo[] {
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
