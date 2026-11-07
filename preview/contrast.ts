import {
  AA_MIN,
  SURFACES,
  evaluatePairs,
  formatRatio,
  semanticColors,
  type PairResult,
} from '../build/a11y/contrast.ts';

/**
 * Contrast comparison page: every brand × theme × mode from the built dist,
 * with rendered specimens and a pair matrix (live ratios + AA/AAA badges).
 * Uses the same pair list and math as the vitest gate.
 */

const base: string = (import.meta as any).env?.BASE_URL ?? '/';
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

type Combo = { brand: string; theme: string; label: string; mode: 'light' | 'dark'; vars: Record<string, string> };

/**
 * Tokens a dist may predate. When one is missing, the page shows what a
 * consumer would have used instead, so a build from before Phase 0 is honest.
 */
const FALLBACKS: Record<string, { from: (c: Record<string, string>) => string | undefined; note: string }> = {
  'text-link': { from: (c) => c['action-primary'], note: 'not defined, using action-primary' },
  'border-control': { from: (c) => c['border'], note: 'not defined, using border' },
  'action-primary-hover': { from: (c) => c['action-primary-active'], note: 'not defined, using action-primary-active' },
  // semantics.css `.focus-ring` utility: action-primary mixed 30% with transparent
  'focus-ring': { from: (c) => c['action-primary'] && c['action-primary'].slice(0, 7) + '4d', note: 'not defined, using the .focus-ring glow (action-primary @ 30%)' },
};

function allVars(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/(--tk-dlite-[\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

async function text(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function load(): Promise<Combo[]> {
  const manifest = JSON.parse(await text(base + 'web/manifest.json')) as { brands: { path: string; label: string }[] };
  const combos: Combo[] = [];
  for (const { path, label } of manifest.brands) {
    const [brand, theme] = path.split('/');
    for (const mode of ['light', 'dark'] as const) {
      const file = mode === 'light' ? 'variables.css' : 'variables.dark.css';
      try {
        const css = await text(base + `web/${path}/${file}`);
        combos.push({ brand, theme, label, mode, vars: allVars(css) });
      } catch {
        /* mode not built for this brand */
      }
    }
  }
  return combos;
}

function withFallbacks(colors: Record<string, string>) {
  const out = { ...colors };
  const notes: Record<string, string> = {};
  for (const [name, fb] of Object.entries(FALLBACKS)) {
    if (out[name]) continue;
    const v = fb.from(out);
    if (v) {
      out[name] = v;
      notes[name] = fb.note;
    }
  }
  return { colors: out, notes };
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const badge = (r: PairResult) =>
  `<span class="badge b-${r.level}">${r.level === 'fail' ? 'Fail' : r.level}</span>`;

function cell(r: PairResult | undefined): string {
  if (!r) return '<td>—</td>';
  const nonText = r.kind === 'non-text';
  const isRing = r.fg === 'focus-ring';
  const chip = nonText
    ? `<span class="chip nt${isRing ? ' ring' : ''}" style="background:${r.bgHex}"><span style="${
        isRing ? `outline:2px solid ${r.fgHex};outline-offset:2px` : r.fg === 'border-control' ? `border:2px solid ${r.fgHex}` : `background:${r.fgHex}`
      }"></span></span>`
    : `<span class="chip" style="background:${r.bgHex};color:${r.fgHex}">Aa</span>`;
  const label = `${r.fg} on ${r.bg}: ${formatRatio(r.ratio)} to 1, ${r.level === 'fail' ? 'fails' : r.level}`;
  return `<td><span class="cell" title="${esc(`${r.fgHex} on ${r.bgHex}`)}" aria-label="${esc(label)}">${chip}<span class="num">${formatRatio(r.ratio)}</span>${badge(r)}</span></td>`;
}

function rowHead(name: string, note: string | undefined, role: string): string {
  return `<th scope="row">${esc(name)}<small>${esc(role)}</small>${note ? `<span class="fallback">${esc(note)}</span>` : ''}</th>`;
}

function panel(c: Combo): { html: string; fails: number } {
  const css = Object.entries(c.vars).map(([k, v]) => `${k}:${v}`).join(';');
  const { colors, notes } = withFallbacks(semanticColors(Object.entries(c.vars).map(([k, v]) => `${k}: ${v};`).join('\n')));
  const results = evaluatePairs(colors);
  const fails = results.filter((r) => r.level === 'fail').length;
  const find = (fg: string, bg: string) => results.find((r) => r.fg === fg && r.bg === bg);

  const ringWidth = c.vars['--tk-dlite-semantic-focus-ring-width'];
  const ringOffset = c.vars['--tk-dlite-semantic-focus-ring-offset'] ?? '2px';
  const specimenVars = [
    `--c-link:${colors['text-link']}`,
    `--c-hover:${colors['action-primary-hover']}`,
    `--c-control:${colors['border-control']}`,
    `--c-ring:${colors['focus-ring']}`,
    `--c-ring-width:${ringWidth ?? '2px'}`,
    `--c-ring-offset:${ringOffset}`,
  ].join(';');

  const surfaceRows = (fgs: string[]) =>
    fgs
      .map((fg) => {
        const any = results.find((r) => r.fg === fg);
        if (!any) return '';
        const cells = SURFACES.map((bg) => find(fg, bg));
        const pass = cells.every((r) => !r || r.level !== 'fail');
        return `<tr class="${pass ? 'pass' : 'fail'}">${rowHead(fg, notes[fg], any.role)}${cells.map(cell).join('')}</tr>`;
      })
      .join('');

  const pairRows = (list: PairResult[]) =>
    list
      .map(
        (r) =>
          `<tr class="${r.level === 'fail' ? 'fail' : 'pass'}">${rowHead(`${r.fg} on ${r.bg}`, notes[r.bg] ?? notes[r.fg], r.role)}${cell(r)}<td colspan="3"></td></tr>`,
      )
      .join('');

  const html = `
  <article class="panel" style="${esc(css)}" aria-label="${esc(`${c.label} ${c.mode}`)}">
    <div class="head"><span>${esc(c.label)} · ${c.mode}</span><span class="fails">${
      fails ? `<span class="badge b-fail">${fails} below AA</span>` : '<span class="badge b-AA">All AA</span>'
    }</span></div>
    <div class="specimen" style="${esc(specimenVars)}" aria-hidden="true">
      <p>Primary text. <span class="t2">Secondary text.</span> <span class="t3">Tertiary text.</span> <span class="link">A link</span></p>
      <button class="btn" tabindex="-1">Primary</button>
      <button class="btn hover" tabindex="-1">Hover</button>
      <button class="btn ${ringWidth ? 'focus' : 'glow'}" tabindex="-1">Focused</button>
      <label class="field">Label<input class="input" value="Input border" tabindex="-1" readonly /></label>
      <span class="check"><span class="box"></span>Checkbox</span>
      <span class="check"><span class="radio"></span>Radio</span>
    </div>
    <div class="scroll">
      <table>
        <thead><tr><th scope="col">Foreground</th>${SURFACES.map((s) => `<th scope="col">on ${s}</th>`).join('')}</tr></thead>
        <tbody>
          <tr class="group"><td colspan="5">Text · needs ${AA_MIN.text}:1</td></tr>
          ${surfaceRows(['text-primary', 'text-secondary', 'text-tertiary', 'text-link', 'feedback-success', 'feedback-warning', 'feedback-danger', 'feedback-info'])}
          <tr class="group"><td colspan="5">Controls, focus and fills · need ${AA_MIN['non-text']}:1</td></tr>
          ${surfaceRows(['border-control', 'focus-ring', 'action-primary'])}
          <tr class="group"><td colspan="5">Button labels and status badges · need ${AA_MIN.text}:1</td></tr>
          ${pairRows(results.filter((r) => r.fg === 'text-on-primary' || /^feedback-\w+-fg$/.test(r.fg)))}
        </tbody>
      </table>
    </div>
  </article>`;
  return { html, fails };
}

function render(combos: Combo[]) {
  const brandFilter = $<HTMLSelectElement>('brand').value;
  const onlyFails = $<HTMLInputElement>('fails').checked;
  const groups = new Map<string, Combo[]>();
  for (const c of combos) {
    const k = `${c.brand}/${c.theme}`;
    if (brandFilter && k !== brandFilter) continue;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(c);
  }
  let total = 0;
  let html = '';
  for (const [k, list] of groups) {
    const panels = list.map(panel);
    total += panels.reduce((n, p) => n + p.fails, 0);
    html += `<section class="brand" aria-label="${esc(k)}"><h2>${esc(list[0].label)}</h2><div class="modes">${panels.map((p) => p.html).join('')}</div></section>`;
  }
  const out = $('out');
  out.className = onlyFails ? 'only-fails' : '';
  out.innerHTML = html || '<p>No brands match.</p>';
  $('summary').textContent = `${groups.size} brand theme${groups.size === 1 ? '' : 's'} · ${total} pair${total === 1 ? '' : 's'} below AA`;
}

(async () => {
  try {
    const combos = await load();
    const sel = $<HTMLSelectElement>('brand');
    const seen = new Set<string>();
    for (const c of combos) {
      const k = `${c.brand}/${c.theme}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const o = document.createElement('option');
      o.value = k;
      o.textContent = c.label;
      sel.append(o);
    }
    const params = new URLSearchParams(location.search);
    if (params.get('brand')) sel.value = params.get('brand')!;
    if (params.get('fails') === '1') $<HTMLInputElement>('fails').checked = true;
    sel.addEventListener('change', () => render(combos));
    $('fails').addEventListener('change', () => render(combos));
    render(combos);
    document.documentElement.dataset.ready = 'true';
  } catch (err) {
    $('out').innerHTML = `<p class="error">Failed to load tokens: ${esc(String((err as Error).message))}</p>`;
  }
})();
