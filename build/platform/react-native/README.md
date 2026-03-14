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

The build produces separate TypeScript files per brand/theme/mode at:

```
dist/rn/{brand}/{theme}/
  light.ts     # light mode tokens
  dark.ts      # dark mode tokens
  index.ts     # barrel — re-exports both + combined tokens object
```

Each mode file exports:

```ts
export const light = { ... } as const;
export type LightTokens = typeof light;
```

The barrel `index.ts` re-exports everything:

```ts
export { light } from './light.ts';
export { dark } from './dark.ts';

export const tokens = { light, dark } as const;
export type Tokens = typeof light;
```

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

All token objects are typed `as const`, so you get full autocomplete and type-checking. The `Tokens` type is exported for use in function signatures:

```ts
import type { Tokens } from 'style-dictionary-dlite-tokens/rn/puente/default';

function getButtonStyle(t: Tokens) {
  return { backgroundColor: t.puenteSemanticColorPrimary };
}
```
