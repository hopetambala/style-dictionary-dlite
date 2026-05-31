# Motion Tokens — Web Usage (agent guide)

How to consume the `semantic.motion.*` tokens from `style-dictionary-dlite-tokens` on the web.
**Pure CSS only — no JS animation library** (no Framer Motion, Motion One, GSAP). Written for
coding agents: copy the recipes, follow the rules at the end.

The web build exposes motion as CSS custom properties (`variables.css`) plus ready-made utility
classes (`semantics.css`). Durations are CSS time strings (`0.3s`); easing is `cubic-bezier(...)`;
scale/opacity are unitless numbers.

---

## 1. Import (once, app-wide)

```js
import 'style-dictionary-dlite-tokens/web/puente/default/variables.css'; // the --tk-dlite-* vars
import 'style-dictionary-dlite-tokens/web/puente/default/semantics.css'; // the .cl-dlite-sem-* utilities
```

## 2. Transitions — the default (STANDARD / QUICK)

Build `transition` from the tokens. Animate **`transform` and `opacity` only**.

```css
.button {
  transition: transform var(--tk-dlite-semantic-motion-duration-base)
                        var(--tk-dlite-semantic-motion-easing-standard);
}
.button:hover  { transform: scale(var(--tk-dlite-semantic-motion-scale-hover)); }   /* 1.05 */
.button:active { transform: scale(var(--tk-dlite-semantic-motion-scale-press)); }   /* 0.95 */

.modal-backdrop {
  opacity: var(--tk-dlite-semantic-motion-opacity-backdrop);                          /* 0.5 */
  transition: opacity var(--tk-dlite-semantic-motion-duration-base)
                      var(--tk-dlite-semantic-motion-easing-exit);
}
```

Or use the generated utilities instead of authoring CSS:

```html
<button class="cl-dlite-sem-transition-transform cl-dlite-sem-scale-hover">Save</button>
```

Available utilities (from `semantics.css`):
- `.cl-dlite-sem-duration-{quick,snappy,base,substantial,slow,xslow}` → `transition-duration`
- `.cl-dlite-sem-ease-{standard,entrance,exit,linear}` → `transition-timing-function`
- `.cl-dlite-sem-transition-{colors,transform,opacity,all}` → full `transition` shorthand
- `.cl-dlite-sem-scale-hover` / `.cl-dlite-sem-scale-active` → scale on `:hover` / `:active`

## 3. "Springy" / celebratory feel — CSS `@keyframes` with overshoot (MEGA)

CSS can't run a real spring, so express bounce with keyframes that **overshoot to
`scale.celebrate` (1.2)** and settle, timed by a duration token. No library needed.

```css
/* Success pop — celebratory entrance */
@keyframes dlite-pop-in {
  0%   { opacity: 0; transform: scale(0.8); }
  70%  { opacity: 1; transform: scale(var(--tk-dlite-semantic-motion-scale-celebrate)); } /* 1.2 */
  100% { transform: scale(1); }
}
.success-check {
  animation: dlite-pop-in var(--tk-dlite-semantic-motion-duration-slow)
                          var(--tk-dlite-semantic-motion-easing-entrance) both;
}

/* List / modal entrance — slide up + fade (spec §5.4 / §5.5) */
@keyframes dlite-slide-up-fade {
  from { opacity: 0; transform: translateY(10px) scale(var(--tk-dlite-semantic-motion-scale-entrance)); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.list-item { animation: dlite-slide-up-fade var(--tk-dlite-semantic-motion-duration-base)
                                            var(--tk-dlite-semantic-motion-easing-entrance) both; }
/* stagger inline: style="animation-delay: calc(var(--i) * 50ms)" */

/* Error shake (spec §5.3) — ±3px */
@keyframes dlite-shake {
  0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); }
  50% { transform: translateX(3px); } 75% { transform: translateX(-3px); }
}
.field-error { animation: dlite-shake var(--tk-dlite-semantic-motion-duration-quick) var(--tk-dlite-semantic-motion-easing-standard); }

/* Spinner loop */
@keyframes dlite-spin { to { transform: rotate(360deg); } }
.spinner { animation: dlite-spin var(--tk-dlite-semantic-motion-duration-pulse) var(--tk-dlite-semantic-motion-easing-linear) infinite; }
```

## 4. Spring scalar vars are NOT for CSS

`--tk-dlite-semantic-motion-spring-*` (`damping`/`stiffness`/`mass`) describe **React Native**
physics. CSS has no way to consume them — do **not** try to plug them into `transition`/`animation`.
On the web, approximate spring energy with the overshoot keyframes in §3 and the `cubic-bezier`
easing tokens. (The spring vars exist only so the RN/JS token map stays symmetric.)

## 5. Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: var(--tk-dlite-semantic-motion-duration-instant) !important; /* 0s */
    animation-duration:  var(--tk-dlite-semantic-motion-duration-instant) !important;
  }
}
```

## 6. Token reference (CSS vars)

| Var (prefix `--tk-dlite-semantic-motion-`) | Value | CSS use |
|---|---|---|
| `duration-{instant,micro,quick,snappy,base,substantial,slow,xslow,pulse,toast,dismiss}` | `0s`…`4s` | `transition-duration`, `animation-duration` |
| `easing-{standard,entrance,exit,linear}` | `cubic-bezier(...)` | `transition-timing-function`, `animation-timing-function` |
| `scale-{press,micro,entrance,celebrate,hover,active}` | number | inside `transform: scale(var(...))` / keyframes |
| `opacity-{interactive,disabled,backdrop,entrance}` | number | `opacity` |
| `spring-{tight,snappy,smooth,playful}-{damping,stiffness,mass}` | number | **RN/JS only — not usable in CSS** |

## Rules for agents

- ✅ Pure CSS (`transition` / `@keyframes`). No JS animation libraries.
- ✅ Animate **`transform` + `opacity` only**. Never width/height/top/left/padding/margin/backgroundColor.
- ✅ Durations and easing always come from `var(--tk-dlite-semantic-motion-*)` (or the utilities). No hardcoded `0.3s`, `ease-in-out`, `cubic-bezier(...)` literals.
- ✅ Bounce/celebration = overshoot keyframe to `scale-celebrate` (≤ 1.2). Don't exceed it.
- ✅ Always include the `prefers-reduced-motion` guard from §5.
- ❌ Don't use `spring-*` vars in CSS. ❌ Don't reach for the RN `tkDliteSemanticMotion*` JS keys on web.
