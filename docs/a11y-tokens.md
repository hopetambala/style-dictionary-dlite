# Accessibility and layout tokens (0.4.0)

Puente's Manage web app is being made mobile responsive and WCAG 2.2 AA. The tokens were the root of several failures:

- `action-primary` #3d80fc was 3.69:1 with white text, so primary button labels failed.
- `text-tertiary` #a5a5a5 was 2.30:1 on the light background.
- There were no focus or control-border tokens, so consumers used a 15–30% glow (about 1.4–1.9:1) and the decorative `border` (1.48:1) for inputs.
- Breakpoints existed only as CSS custom properties, which can't be used inside `@media`.

The plan below is copied from the Manage overhaul plan (`docs/responsive-a11y-overhaul.md` in `puente-react-nextjs-platform`, section "Phase 0"). The notes after it record where the implementation differs.

## Plan: Phase 0: style-dictionary-dlite (`~/Documents/development/hobby/style-dictionary-dlite`, branch `feat/a11y-layout-tokens`)

1. **Breakpoints usable in CSS and JS.** Add two global (not per-brand) web outputs, wired in `build/index.ts` after the brand loop:
   - `dist/web/custom-media.css`: `@custom-media --tk-dlite-bp-sm-up (min-width: 640px)`, and `-md-up`, `-lg-up`, `-xl-up`, plus `--tk-dlite-bp-*-down (max-width: …)` using `-0.02px`. Generated from `semantic.breakpoint`.
   - `dist/web/breakpoints.json`: `{ sm: 640, md: 768, lg: 1024, xl: 1280 }`, for the MUI theme and JS.

   Add new formats in `build/formats/` and export them from `build/formats/index.ts`. The `./web/*` export already covers both paths.
2. **New global semantic tokens** in `tokens/globals/semantic.tokens.json`, emitted to variables.css:
   - `color-focus-ring` (blue-700), `focus-ring-width` 2px, `focus-ring-offset` 2px
   - `sizing-target-min` 24px, `sizing-target-comfortable` 44px
   - `color-text-link` (defaults to `action-primary`)
   - `color-border-control`: the 3:1 boundary for inputs, checkboxes and radios. Decorative `border` stays.
3. **Contrast fixes upstream, in the shared semantic layer** (`tokens/globals/semantic.tokens.json`), not as a Puente override.
   - Kooky, Sneaks and Survivor already override `action-primary`, `action-primary-active`, `text-on-primary` and `text-tertiary` in their own brand files. So these edits change only Puente's output for existing tokens, and other brands just gain the new tokens.
   - Dist snapshot diffs must show exactly that.

   | Token | Light now → proposed | Dark now → proposed |
   |---|---|---|
   | `action-primary` | blue-500 #3d80fc (white 3.69:1) → **blue-600 #1b5fdb** (white 5.67:1) | blue-400, unchanged |
   | `text-on-primary` | white, unchanged | white (2.56:1 on blue-400) → **neutral-900** (7.06:1) |
   | `action-primary-hover` (new) | blue-700 | blue-300 |
   | `action-primary-active` | blue-700 → **blue-800** | blue-300, unchanged |
   | `text-tertiary` | neutral-500 (2.30:1) → **neutral-600** (4.76:1) | neutral-500 (7.35:1), unchanged |
   | `text-link` (new) | alias of `action-primary` (5.29:1 on background) | alias (7.06:1) |
   | `border-control` (new) | neutral-600 (5.10:1; today's `border` is 1.48:1) | neutral-600 (3.55:1) |
   | `focus-ring-color` (new) | alias of `action-primary` (5.29:1) | blue-300 (10.15:1) |
   | `focus-ring-width` / `-offset` (new) | 2px / 2px | same |
   | `sizing-target-min` / `-comfortable` (new) | 24px / 44px | same |

   These are the values in the before/after visual shown in chat.
3b. **A permanent comparison page in the token repo's preview app** (`preview/`, deployed by `pages.yml`). It shows every brand × mode's text, link, button, control-border and focus pairs as rendered swatches, with live contrast ratios and AA/AAA badges, computed from the built `dist/web/*/variables*.css`. The PR description links a before/after of that page, built from `main` and from the branch. It also gets published as a private Artifact so Hope can compare before approving the release.
4. **Contrast gate:** `__tests__/contrast.test.ts` (vitest) reads `dist/web/puente/default/variables{,.dark}.css`. It asserts text pairs (text-primary/secondary/tertiary/link, text-on-primary on action-primary, feedback colors) are ≥4.5:1 on `background`/`surface-*`, and `border-control`, `focus-ring` and `action-primary` are ≥3:1. Reuse the luminance math prototyped in the scratchpad `contrast.mjs`.
5. Update dist snapshots (`__tests__/dist-snapshots.test.ts`, `npm run test:update`). Document breakpoints, focus and target tokens in `README.md` and `build/platform/web/README.md`.
6. Commit as `feat!:`. That makes commit-and-tag-version cut **0.4.0**, so the website (`^0.3.10`) and Collect (`^0.2.7`) don't pick up the color change silently.

**Pause for Hope's approval before merging to `main`.** The `publish.yml` workflow publishes to npm on every push to main.


## Implementation notes

- **Names.** The focus colour is `color.focus-ring` → `--tk-dlite-semantic-color-focus-ring`, in the colour group with every other colour, so brand files override it in their `color` block. Width and offset are `--tk-dlite-semantic-focus-ring-width` / `-offset`. Targets are `--tk-dlite-semantic-sizing-target-min` / `-comfortable`.
- **Focus ring colour.** Light is an alias of `action-primary` (the table), not blue-700 (the bullet in step 2). Dark is blue-300.
- **Other brands.** Kooky, Sneaks and Survivor (all three themes) set `focus-ring` to their own `action-primary` and `action-primary-hover` to their own `action-primary-active`, so Puente blue doesn't leak into them. `border-control` is neutral-600 for every brand. Their existing token values are unchanged; the dist diff for them is additions only.
- **Shared math.** `build/a11y/contrast.ts` holds the WCAG luminance math and the pair list. Both the gate and `preview/contrast.html` import it.
- **Known gaps in the gate.** Three Puente pairs miss AA and weren't part of the approved values: dark `feedback-danger` on `surface-raised` / `surface-sunken` (4.46:1) and light `feedback-warning-fg` on `feedback-warning-bg` (4.36:1). `PUENTE_KNOWN_GAPS` in `__tests__/contrast.test.ts` lists them and fails once one is fixed. `muted` (neutral-500, 2.30:1, used by `.text-muted`) isn't gated.
- **Not changed.** The `.focus-ring` and `.shadow-focus` utilities in `semantics.css` still use the glow, so no brand's `semantics.css` changes in this release.
