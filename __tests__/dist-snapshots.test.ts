import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const DIST_WEB = path.resolve('dist/web');

function collectFiles(dir: string, base: string = dir): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(full, base));
    } else {
      files.push(path.relative(base, full));
    }
  }
  return files.sort();
}

beforeAll(() => {
  if (!fs.existsSync(DIST_WEB)) {
    throw new Error(
      'dist/web/ folder not found. Run `yarn build` before running snapshot tests.',
    );
  }
});

// Discover brands (top-level dirs under dist/web/)
const brands = fs.existsSync(DIST_WEB)
  ? fs.readdirSync(DIST_WEB, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
  : [];

for (const brand of brands) {
  const brandDir = path.join(DIST_WEB, brand);
  const themes = fs.readdirSync(brandDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const theme of themes) {
    const themeDir = path.join(brandDir, theme);
    const files = collectFiles(themeDir);

    describe(`${brand}/${theme}`, () => {
      test('file list matches snapshot', async () => {
        await expect(JSON.stringify(files, null, 2)).toMatchFileSnapshot(
          `__snapshots__/${brand}/${theme}/file-list.snap`,
        );
      });

      for (const file of files) {
        test(`${file} matches snapshot`, async () => {
          const content = fs.readFileSync(path.join(themeDir, file), 'utf-8');
          await expect(content).toMatchFileSnapshot(
            `__snapshots__/${brand}/${theme}/${file}.snap`,
          );
        });
      }
    });
  }
}
