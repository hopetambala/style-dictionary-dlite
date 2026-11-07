# Web Platform (CSS Variables)

## Install

```bash
npm install style-dictionary-dlite-tokens
```

## Output

The build produces CSS custom-property files at:

```
dist/web/{brand}/{theme}/variables.css       # light mode
dist/web/{brand}/{theme}/variables.dark.css  # dark mode
dist/web/custom-media.css                    # breakpoints as @custom-media (all brands)
dist/web/breakpoints.json                    # breakpoints as px numbers (all brands)
```

## Usage

### Import directly

```css
@import 'style-dictionary-dlite-tokens/web/puente/default/variables.css';
@import 'style-dictionary-dlite-tokens/web/puente/default/variables.dark.css';
```

### Dark mode with `prefers-color-scheme`

Use the media query condition on the `@import` itself:

```css
@import 'style-dictionary-dlite-tokens/web/puente/default/variables.css';
@import 'style-dictionary-dlite-tokens/web/puente/default/variables.dark.css' (prefers-color-scheme: dark);
```

Or use `<link>` tags in HTML:

```html
<link rel="stylesheet" href="node_modules/style-dictionary-dlite-tokens/dist/web/puente/default/variables.css">
<link rel="stylesheet" href="node_modules/style-dictionary-dlite-tokens/dist/web/puente/default/variables.dark.css" media="(prefers-color-scheme: dark)">
```

To scope dark tokens to a `[data-theme="dark"]` attribute you toggle in JS, use a CSS layer or bundler-based approach:

```js
// In your JS entry point
import 'style-dictionary-dlite-tokens/web/puente/default/variables.css';

if (document.documentElement.dataset.theme === 'dark') {
  import('style-dictionary-dlite-tokens/web/puente/default/variables.dark.css');
}
```

### Use the variables

Once imported, reference tokens as CSS custom properties:

```css
.button {
  background-color: var(--tk-dlite-semantic-color-primary);
  border-radius: var(--tk-dlite-semantic-border-radius-md);
  color: var(--tk-dlite-semantic-color-text-on-brand);
}
```

### Breakpoints

Custom properties don't work inside `@media`, so use the generated custom media queries. They need [postcss-custom-media](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-custom-media) (Next.js: add it to `postcss.config.js`) or native `@custom-media` support.

```css
@import 'style-dictionary-dlite-tokens/web/custom-media.css';

.sidebar { display: none; }
@media (--tk-dlite-bp-md-up) { .sidebar { display: block; } }   /* ≥ 768px */
@media (--tk-dlite-bp-sm-down) { .table { font-size: 14px; } }   /* ≤ 639.98px */
```

| Name | Up (`min-width`) | Down (`max-width`) |
| ---- | ---------------- | ------------------ |
| `sm` | 640px | 639.98px |
| `md` | 768px | 767.98px |
| `lg` | 1024px | 1023.98px |
| `xl` | 1280px | 1279.98px |

In JS:

```js
import breakpoints from 'style-dictionary-dlite-tokens/web/breakpoints.json' with { type: 'json' };
// { sm: 640, md: 768, lg: 1024, xl: 1280 }
createTheme({ breakpoints: { values: { xs: 0, ...breakpoints } } });
```

### Focus, controls and targets

```css
:focus-visible {
  outline: var(--tk-dlite-semantic-focus-ring-width) solid var(--tk-dlite-semantic-color-focus-ring);
  outline-offset: var(--tk-dlite-semantic-focus-ring-offset);
}

input, select, textarea {
  border: 1px solid var(--tk-dlite-semantic-color-border-control); /* 3:1 boundary */
}

.icon-button {
  min-width: var(--tk-dlite-semantic-sizing-target-min);          /* 24px, WCAG 2.5.8 */
  min-height: var(--tk-dlite-semantic-sizing-target-min);
}

@media (pointer: coarse) {
  .icon-button {
    min-width: var(--tk-dlite-semantic-sizing-target-comfortable); /* 44px */
    min-height: var(--tk-dlite-semantic-sizing-target-comfortable);
  }
}

a { color: var(--tk-dlite-semantic-color-text-link); }
.button-primary:hover { background: var(--tk-dlite-semantic-color-action-primary-hover); }
```

Use `color-border-control` for anything a user has to find to operate (inputs, checkboxes, radios). Keep `color-border` for decorative dividers.

## Available brands & themes

| Brand      | Theme            |
| ---------- | ---------------- |
| `puente`   | `default`        |
| `survivor` | `default`        |
| `survivor` | `jungle`         |
| `survivor` | `winter-holiday` |

## Naming convention

Tokens follow the pattern `--tk-dlite-{tier}-{category}-{name}` in kebab-case:

- `--tk-dlite-semantic-color-primary`
- `--tk-dlite-primitive-color-blue-500`
