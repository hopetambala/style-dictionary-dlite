# Style Dictionary — Multi-Brand, Multi-Theme Design Tokens

[Head to this page to checkout what's available!](https://hopetambala.github.io/style-dictionary-dlite/)

Design tokens built with [Style Dictionary v5](https://styledictionary.com/) following the [W3C Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/) spec, including the [DTCG 2025.10 Color Module](https://www.designtokens.org/tr/2025.10/color/) (sRGB object format).

## Architecture

```
tokens/
├── globals/
│   ├── primitives.tokens.json   ← Raw values grouped by DTCG type
│   ├── semantic.tokens.json     ← Semantic decisions referencing primitives
│   └── global.tokens.json       ← Composes semantic via $extends
└── brands/
    ├── puente.tokens.json       ← Brand: $extends global, themes + modes
    └── survivor.tokens.json     ← Brand: $extends global, themes + modes
```

### Token Tiers

**Primitives** — Context-free raw values organized by DTCG specification type:

| Group | `$type` | Examples |
|-------|---------|----------|
| `primitive.color` | `color` | white, black, neutral.100–900, blue, green, red, etc. |
| `primitive.dimension` | `dimension` | font-size, letter-spacing, radius |
| `primitive.fontWeight` | `fontWeight` | regular (400), medium, semibold, bold |
| `primitive.number` | `number` | opacity, line-height |
| `primitive.shadow` | `shadow` | 100, 200, 300, 400 |

Colors use the DTCG 2025.10 sRGB object format:

```json
{
  "$value": {
    "colorSpace": "srgb",
    "components": [0.1176, 0.3843, 0.9098],
    "hex": "#1e62e8"
  }
}
```

**Semantic** — Purpose-driven tokens that reference primitives. Dark mode values are co-located on each token via `$extensions.mode`:

```json
{
  "primary": {
    "$value": "{primitive.color.blue.500}",
    "$extensions": { "mode": { "dark": "{primitive.color.blue.400}" } }
  }
}
```

The `$value` is the default (light). `$extensions.mode.dark` only appears when the dark value differs.

**Global** — Composes primitives + semantic via `$extends`, serving as the inheritance root for all brands.

### Brands, Themes, and Modes

| Concept | Description | Example |
|---------|-------------|---------|
| **Brand** | A company or product | puente, survivor |
| **Theme** | A visual variation | default, winter-holiday |
| **Mode** | Light/dark appearance | light, dark |

- **Globals** have modes (light/dark) but no themes
- **Brands** have themes, and each theme has modes

```json
{
  "survivor": {
    "$extends": "{global}",
    "themes": {
      "default": {
        "modes": {
          "light": {},
          "dark": {}
        }
      },
      "winter-holiday": {
        "modes": {
          "light": {
            "color": {
              "$type": "color",
              "primary": {
                "$value": "{primitive.color.green.600}",
                "$extensions": { "mode": { "dark": "{primitive.color.green.400}" } }
              },
              "secondary": {
                "$value": "{primitive.color.yellow.600}",
                "$extensions": { "mode": { "dark": "{primitive.color.yellow.400}" } }
              }
            }
          },
          "dark": {}
        }
      }
    }
  }
}
```

### How it works

At build time, `build.ts`:

1. Loads all `.tokens.json` files into a single document
2. Resolves chained `$extends` references (deep merge per W3C spec §6.4)
3. For each brand, discovers all theme × mode combinations
4. Applies inline `$extensions.mode` overrides for the current mode (both on global tokens and brand theme overrides)
5. Merges brand theme overrides on top of the resolved globals
6. Feeds the resolved token set to Style Dictionary for platform output (CSS, React Native)

### Output

```
dist/web/
├── puente/
│   └── default/
│       ├── variables.css          ← light mode CSS custom properties
│       ├── variables.dark.css     ← dark mode
│       ├── reset.css              ← global CSS reset
│       ├── utilities.css          ← pure CSS utilities (layout, text)
│       ├── primitives.css         ← primitive token classes (colors, weights)
│       ├── semantics.css          ← semantic token classes (spacing, typography)
│       └── components.css         ← compound component classes (buttons, inputs)
└── survivor/
    ├── default/
    │   ├── variables.css
    │   ├── variables.dark.css
    │   ├── reset.css
    │   ├── utilities.css
    │   ├── primitives.css
    │   ├── semantics.css
    │   └── components.css
    ├── jungle/
    │   ├── variables.css
    │   ├── variables.dark.css
    │   ├── reset.css
    │   ├── utilities.css
    │   ├── primitives.css
    │   ├── semantics.css
    │   └── components.css
    └── winter-holiday/
        ├── variables.css
        ├── variables.dark.css
        ├── reset.css
        ├── utilities.css
        ├── primitives.css
        ├── semantics.css
        └── components.css
```

### Naming Convention

**CSS variables** use a fixed `tk-dlite` prefix with the token tier:

```css
--tk-dlite-primitive-color-blue-500: #3d80fc;
--tk-dlite-semantic-color-primary: #3d80fc;
--tk-dlite-semantic-typography-size-400: 1rem;
```

**CSS classes** use prefixes based on their source:

| File | Prefix | Example |
|------|--------|---------|
| utilities.css | `cl-dlite-` | `.cl-dlite-flex` |
| primitives.css | `cl-dlite-prim-` | `.cl-dlite-prim-bg-blue-500` |
| semantics.css | `cl-dlite-sem-` | `.cl-dlite-sem-p-400` |
| components.css | `cl-dlite-` | `.cl-dlite-btn-primary` |

## Usage

### Loading fonts

The design system uses three Google Fonts that consumers must load. Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Source+Serif+4:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

Or with a framework like Next.js (using `next/font/google`):

```tsx
// app/layout.tsx
import { Plus_Jakarta_Sans, Source_Serif_4, Source_Code_Pro } from 'next/font/google';

const heading = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading' });
const body = Source_Serif_4({ subsets: ['latin'], variable: '--font-body' });
const mono = Source_Code_Pro({ subsets: ['latin'], variable: '--font-mono' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

| Token | Font | Role |
|-------|------|------|
| `font-heading` | Plus Jakarta Sans | Headings, labels, UI chrome |
| `font-body` | Source Serif 4 | Body text, paragraphs |
| `font-mono` | Source Code Pro | Code, data tables |

### Build commands

```sh
npm install
npm run build          # generates dist/
npm run clean          # removes dist/
npm run test           # runs snapshot tests against dist/
npm run test:update    # updates snapshots after intentional changes
```

### Local development

Preview all tokens (colors, spacing, typography, radii, elevation) across every brand, theme, and mode in the browser:

```sh
npm run build          # build tokens into dist/ (required before first preview)
npm run preview        # start Vite dev server
```

This starts a Vite dev server at `http://localhost:5173` with a toolbar to switch between brands and modes (Light, Dark). The preview reads from `dist/`, so re-run `npm run build` after changing any token files.

To build the static preview site (same page deployed to GitHub Pages):

```sh
npm run build:preview
```

The live preview is available at **https://hopetambala.github.io/style-dictionary-dlite/**.

## Adding a new brand

Create `tokens/brands/my-brand.tokens.json`:

```json
{
  "my-brand": {
    "$extends": "{global}",
    "themes": {
      "default": {
        "modes": {
          "light": {
            "color": {
              "$type": "color",
              "primary": {
                "$value": "{primitive.color.purple.600}",
                "$extensions": { "mode": { "dark": "{primitive.color.purple.400}" } }
              }
            }
          },
          "dark": {}
        }
      }
    }
  }
}
```

Run `npm run build` — it auto-discovers new brands and their themes.

## Adding a new theme

Add a new key under `themes` in any brand file:

```json
"themes": {
  "default": { ... },
  "high-contrast": {
    "modes": {
      "light": {
        "color": {
          "$type": "color",
          "foreground": { "$value": "{primitive.color.black}" },
          "background": {
            "$value": "{primitive.color.white}",
            "$extensions": { "mode": { "dark": "{primitive.color.black}" } }
          }
        }
      },
      "dark": {}
    }
  }
}
```

## Custom Transforms

| Transform | Type | Purpose |
|-----------|------|---------|
| `name/brand-tier-kebab` | name | Prefixes tokens with `{brand}-{primitive\|semantic}-` |
| `value/dtcg-color` | value | Converts DTCG sRGB color objects → CSS hex strings |
| `value/shadow-css` | value | Converts shadow token objects → CSS `box-shadow` strings |

## W3C DTCG Spec Compliance

| Feature | Spec section | Status |
|---------|-------------|--------|
| `$value`, `$type` token format | §5.1, §5.2.2 | ✅ |
| `.tokens.json` file extension | §4.2 | ✅ |
| Group-level `$type` inheritance | §6.7.3 | ✅ |
| `$extends` (deep merge, chained) | §6.4 | ✅ |
| DTCG 2025.10 Color Module (sRGB) | Color spec | ✅ |
| `$extensions` for mode metadata | §6.9 | ✅ |
| Curly brace alias syntax | §7.1.1 | ✅ Via Style Dictionary |
