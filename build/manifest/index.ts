import fs from 'node:fs';
import path from 'node:path';

/**
 * Scan dist/web/ to discover all brand/theme combos and write manifest.json
 * for the preview app.
 */
export function generateManifest(webDir = 'dist/web'): void {
  const manifest: { brands: { name: string; path: string; label: string }[] } = { brands: [] };

  if (fs.existsSync(webDir)) {
    for (const brand of fs.readdirSync(webDir).sort()) {
      const brandDir = path.join(webDir, brand);
      if (!fs.statSync(brandDir).isDirectory()) continue;
      for (const theme of fs.readdirSync(brandDir).sort()) {
        const themeDir = path.join(brandDir, theme);
        if (!fs.statSync(themeDir).isDirectory()) continue;
        const p = `${brand}/${theme}`;
        const label = `${brand.charAt(0).toUpperCase() + brand.slice(1)}${theme === 'default' ? '' : ` ${theme.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}`;
        manifest.brands.push({ name: p, path: p, label });
      }
    }
  }

  fs.writeFileSync(path.join(webDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✔︎ ${webDir}/manifest.json`);
}
