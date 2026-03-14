# React Native Platform (Expo)

## Install

```bash
npx expo install style-dictionary-dlite-tokens
```

Or with npm:

```bash
npm install style-dictionary-dlite-tokens
```

## Output

The build produces JavaScript files with TypeScript declarations per brand/theme/mode at:

```
dist/rn/{brand}/{theme}/
  light.js      # light mode tokens
  light.d.ts    # light mode type declarations
  dark.js       # dark mode tokens
  dark.d.ts     # dark mode type declarations
  index.js      # barrel — re-exports both + combined tokens object
  index.d.ts    # barrel type declarations
```

Each mode file exports:

```js
export const light = { ... };
```

The barrel `index.js` re-exports everything:

```js
export { light } from './light.js';
export { dark } from './dark.js';

export const tokens = { light, dark };
```

Type declarations (`.d.ts`) provide full autocomplete and type-checking in TypeScript projects.

Dimension values (spacing, radii, font sizes) are converted to numbers (rem → px at base 16) so they can be used directly in React Native styles without parsing.

## Usage

### Basic — with `useColorScheme`

```tsx
import { useColorScheme, Text, View } from 'react-native';
import { tokens } from 'style-dictionary-dlite-tokens/rn/puente/default';

export default function App() {
  const scheme = useColorScheme() ?? 'light';
  const t = tokens[scheme];

  return (
    <View style={{ backgroundColor: t.puenteSemanticColorBackground, flex: 1 }}>
      <Text style={{ color: t.puenteSemanticColorOnBackground }}>
        Hello World
      </Text>
    </View>
  );
}
```

### Creating a theme hook

```tsx
import { useColorScheme } from 'react-native';
import { tokens, type Tokens } from 'style-dictionary-dlite-tokens/rn/puente/default';

export function useTokens(): Tokens {
  const scheme = useColorScheme() ?? 'light';
  return tokens[scheme];
}
```

Then in any component:

```tsx
import { useTokens } from '@/hooks/useTokens';

function MyButton() {
  const t = useTokens();

  return (
    <Pressable
      style={{
        backgroundColor: t.puenteSemanticColorPrimary,
        borderRadius: t.puenteSemanticBorderRadiusMd,
        padding: 12,
      }}
    >
      <Text style={{ color: t.puenteSemanticColorOnPrimary }}>
        Press me
      </Text>
    </Pressable>
  );
}
```

### With StyleSheet

```tsx
import { StyleSheet } from 'react-native';
import { light } from 'style-dictionary-dlite-tokens/rn/puente/default/light';

const t = light;

const styles = StyleSheet.create({
  container: {
    backgroundColor: t.puenteSemanticColorBackground,
    flex: 1,
  },
  heading: {
    color: t.puenteSemanticColorOnBackground,
    fontSize: 24,
  },
});
```

> **Note:** `StyleSheet.create` is static — it won't react to color-scheme changes.
> Use the `useTokens()` hook with inline styles or a dynamic styling library for dark-mode support.

## Available brands & themes

| Brand      | Theme            |
| ---------- | ---------------- |
| `puente`   | `default`        |
| `survivor` | `default`        |
| `survivor` | `winter-holiday` |

## Naming convention

Tokens use camelCase following the pattern `{brand}{Tier}{Category}{Name}`:

- `puenteSemanticColorPrimary`
- `puentePrimitiveColorBlue500`

## TypeScript

All token objects are fully typed in the generated `.d.ts` files, so you get autocomplete and type-checking. The `Tokens` type is exported for use in function signatures:

```ts
import type { Tokens } from 'style-dictionary-dlite-tokens/rn/puente/default';

function getButtonStyle(t: Tokens) {
  return { backgroundColor: t.puenteSemanticColorPrimary };
}
```
