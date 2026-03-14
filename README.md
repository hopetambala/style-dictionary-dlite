# Style Dictionary — Multi-Brand, Multi-Theme Design Tokens

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

**Primitives** — Context-free raw values organized by DTCG type:

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
              "primary": { "$value": "{primitive.color.red.600}" },
              "secondary": { "$value": "{primitive.color.green.600}" }
            }
          },
          "dark": {
            "color": {
              "$type": "color",
              "primary": { "$value": "{primitive.color.red.500}" },
              "secondary": { "$value": "{primitive.color.green.400}" }
            }
          }
        }
      }
    }
  }
}
```

### How it works

At build time, `build.js`:

1. Loads all `.tokens.json` files into a single document
2. Resolves chained `$extends` references (deep merge per W3C spec §6.4)
3. For each brand, discovers all theme × mode combinations
4. Applies inline `$extensions.mode` overrides for the current mode
5. Merges brand theme+mode overrides on top
6. Feeds the resolved token set to Style Dictionary for CSS output

### Output

```
dist/web/
├── puente/
│   └── default/
│       ├── variables.css          ← light mode
│       └── variables.dark.css     ← dark mode
└── survivor/
    ├── default/
    │   ├── variables.css
    │   └── variables.dark.css
    └── winter-holiday/
        ├── variables.css
        └── variables.dark.css
```

CSS variables follow the naming convention: `--{brand}-{tier}-{category}-{token}`

```css
--puente-primitive-color-blue-500: #1e62e8;
--puente-semantic-color-primary: #1e62e8;
--puente-semantic-typography-size-base: 1rem;
--survivor-semantic-color-primary: #d84215;  /* winter-holiday theme */
```

## Usage

```sh
yarn install
yarn build     # generates dist/
yarn clean     # removes dist/
```

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
              "primary": { "$value": "{primitive.color.purple.600}" }
            }
          },
          "dark": {}
        }
      }
    }
  }
}
```

Run `yarn build` — it auto-discovers new brands and their themes.

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
          "background": { "$value": "{primitive.color.white}" }
        }
      },
      "dark": {
        "color": {
          "$type": "color",
          "foreground": { "$value": "{primitive.color.white}" },
          "background": { "$value": "{primitive.color.black}" }
        }
      }
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
