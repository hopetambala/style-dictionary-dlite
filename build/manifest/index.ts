import fs from 'node:fs';
import path from 'node:path';

/**
 * Scan dist/web/ to discover all brand/theme combos and write manifest.json
 * for the preview app. Only includes directories that contain token output
 * (identified by presence of variables.css).
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
        // Only include directories that contain token output (filter out fonts, other artifacts)
        if (!fs.existsSync(path.join(themeDir, 'variables.css'))) continue;
        const p = `${brand}/${theme}`;
        const label = `${brand.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}${theme === 'default' ? '' : ` ${theme.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}`;
        manifest.brands.push({ name: p, path: p, label });
      }
    }
  }

  if (!fs.existsSync(webDir)) {
    fs.mkdirSync(webDir, { recursive: true });
  }

  fs.writeFileSync(path.join(webDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✔︎ ${webDir}/manifest.json`);
}
