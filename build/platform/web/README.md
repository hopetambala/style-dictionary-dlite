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
```

## Usage

### Import directly

```css
@import 'style-dictionary-dlite-tokens/dist/web/puente/default/variables.css';
@import 'style-dictionary-dlite-tokens/dist/web/puente/default/variables.dark.css';
```

### Dark mode with `prefers-color-scheme`

Wrap the dark-mode import so it applies automatically:

```css
@import 'style-dictionary-dlite-tokens/dist/web/puente/default/variables.css';

@media (prefers-color-scheme: dark) {
  :root {
    @import 'style-dictionary-dlite-tokens/dist/web/puente/default/variables.dark.css';
  }
}
```

Or load both files and scope dark tokens to a `[data-theme="dark"]` attribute you toggle in JS:

```css
/* light (default) */
@import 'style-dictionary-dlite-tokens/dist/web/puente/default/variables.css';

/* dark (scoped) */
[data-theme='dark'] {
  @import 'style-dictionary-dlite-tokens/dist/web/puente/default/variables.dark.css';
}
```

### Use the variables

Once imported, reference tokens as CSS custom properties:

```css
.button {
  background-color: var(--puente-semantic-color-primary);
  border-radius: var(--puente-semantic-border-radius-md);
  color: var(--puente-semantic-color-on-primary);
}
```

## Available brands & themes

| Brand      | Theme            |
| ---------- | ---------------- |
| `puente`   | `default`        |
| `survivor` | `default`        |
| `survivor` | `winter-holiday` |

## Naming convention

Tokens follow the pattern `--{brand}-{tier}-{category}-{name}` in kebab-case:

- `--puente-semantic-color-primary`
- `--puente-primitive-color-blue-500`
