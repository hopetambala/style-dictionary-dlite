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

The build produces a single TypeScript file per brand/theme at:

```
dist/rn/{brand}/{theme}/tokens.ts
```

Each file exports:

```ts
export const light = { ... } as const;
export const dark = { ... } as const;

export const tokens = { light, dark } as const;
export type Tokens = typeof light;
```

## Usage

### Basic — with `useColorScheme`

```tsx
import { useColorScheme, Text, View } from 'react-native';
import { tokens } from 'style-dictionary-dlite-tokens/dist/rn/puente/default/tokens';

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
import { tokens, type Tokens } from 'style-dictionary-dlite-tokens/dist/rn/puente/default/tokens';

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
        borderRadius: parseInt(t.puenteSemanticBorderRadiusMd),
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
import { tokens } from 'style-dictionary-dlite-tokens/dist/rn/puente/default/tokens';

const t = tokens.light;

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
import type { Tokens } from 'style-dictionary-dlite-tokens/dist/rn/puente/default/tokens';

function getButtonStyle(t: Tokens) {
  return { backgroundColor: t.puenteSemanticColorPrimary };
}
```
