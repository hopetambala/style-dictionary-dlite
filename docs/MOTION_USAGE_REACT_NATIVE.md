# Motion Tokens — React Native Usage (agent guide)

How to consume the `semantic.motion.*` tokens from `style-dictionary-dlite-tokens` in a React
Native + Reanimated app. Written for coding agents: copy the patterns, follow the rules at the end.

**Boundary:** this package ships motion **values only**. The behavior layer — `useMotion()`,
`animationRules.js`, `MOTION_HIERARCHY`, the reduced-motion guard, the `lint:animations` check —
lives in the app (see `puente-reactnative-collect/modules/utils/`). Point that layer at these
tokens instead of hardcoding numbers.

---

## 1. Import the token map

The RN build emits one flat object per brand/theme with `light` + `dark` modes. Keys are camelCased
and prefixed `tkDliteSemanticMotion…`. Durations are already in **milliseconds (numbers)**; easing
is a raw **`[x1,y1,x2,y2]` array**; spring sub-values and scale/opacity are **numbers**.

```js
import { light as tokens } from 'style-dictionary-dlite-tokens/rn/puente/default';
// dark mode: import { dark } from '...'; or import { tokens } and pick by color scheme.

tokens.tkDliteSemanticMotionDurationBase;        // 300   (ms)
tokens.tkDliteSemanticMotionSpringSnappyDamping; // 14
tokens.tkDliteSemanticMotionEasingStandard;      // [0.42, 0, 0.58, 1]
tokens.tkDliteSemanticMotionScalePress;          // 0.95
```

## 2. Rebuild `MOTION_TOKENS` from the token map (do this once, in `animations.js`)

Reassemble the ergonomic shape the app already uses. Springs come in as flat keys, so group them;
easing comes in as a bezier array, so wrap it with `Easing.bezier`.

```js
import { Easing } from 'react-native-reanimated';
import { light as t } from 'style-dictionary-dlite-tokens/rn/puente/default';

const spring = (name) => ({
  damping:   t[`tkDliteSemanticMotionSpring${name}Damping`],
  stiffness: t[`tkDliteSemanticMotionSpring${name}Stiffness`],
  mass:      t[`tkDliteSemanticMotionSpring${name}Mass`],
});

export const MOTION_TOKENS = {
  duration: {
    instant: t.tkDliteSemanticMotionDurationInstant,   // 0
    micro:   t.tkDliteSemanticMotionDurationMicro,     // 80
    quick:   t.tkDliteSemanticMotionDurationQuick,     // 150
    snappy:  t.tkDliteSemanticMotionDurationSnappy,    // 200
    base:    t.tkDliteSemanticMotionDurationBase,      // 300
    substantial: t.tkDliteSemanticMotionDurationSubstantial, // 400
    slow:    t.tkDliteSemanticMotionDurationSlow,      // 500
    xslow:   t.tkDliteSemanticMotionDurationXslow,     // 700
    pulse:   t.tkDliteSemanticMotionDurationPulse,     // 1000
    toast:   t.tkDliteSemanticMotionDurationToast,     // 3000
    dismiss: t.tkDliteSemanticMotionDurationDismiss,   // 4000
  },
  spring: {
    tight: spring('Tight'), snappy: spring('Snappy'),
    smooth: spring('Smooth'), playful: spring('Playful'),
  },
  easing: {
    standard: Easing.bezier(...t.tkDliteSemanticMotionEasingStandard),
    entrance: Easing.bezier(...t.tkDliteSemanticMotionEasingEntrance),
    exit:     Easing.bezier(...t.tkDliteSemanticMotionEasingExit),
    linear:   Easing.linear,
  },
  scale: {
    press: t.tkDliteSemanticMotionScalePress, micro: t.tkDliteSemanticMotionScaleMicro,
    entrance: t.tkDliteSemanticMotionScaleEntrance, celebrate: t.tkDliteSemanticMotionScaleCelebrate,
    hover: t.tkDliteSemanticMotionScaleHover, active: t.tkDliteSemanticMotionScaleActive,
  },
  opacity: {
    interactive: t.tkDliteSemanticMotionOpacityInteractive,
    disabled: t.tkDliteSemanticMotionOpacityDisabled,
    backdrop: t.tkDliteSemanticMotionOpacityBackdrop,
    entrance: t.tkDliteSemanticMotionOpacityEntrance,
  },
};
```

Everything downstream (`useMotion`, components) keeps importing `MOTION_TOKENS` exactly as before —
only the source changed from inline literals to tokens.

## 3. Consume via the existing hook

```js
import { useMotion } from '@modules/utils/useMotion';

const { duration, spring, scale, shouldAnimate } = useMotion({ componentType: 'button' });
```

## 4. Reanimated patterns (use these verbatim)

**Press feedback (STANDARD → `snappy`):**
```js
const s = useSharedValue(1);
const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
const onPressIn  = () => { s.value = withSpring(MOTION_TOKENS.scale.press, MOTION_TOKENS.spring.snappy); };
const onPressOut = () => { s.value = withSpring(1, MOTION_TOKENS.spring.snappy); };
```

**Timed transition (when not using spring):**
```js
opacity.value = withTiming(1, {
  duration: MOTION_TOKENS.duration.base,
  easing: MOTION_TOKENS.easing.standard,
});
```

**Staggered list/card entrance (MEGA/STANDARD, spec §5.4):**
```js
import Animated, { Keyframe } from 'react-native-reanimated';
const CardEntrance = new Keyframe({
  0:   { opacity: 0, transform: [{ translateY: 10 }, { scale: MOTION_TOKENS.scale.entrance }] },
  100: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
});
<Animated.View entering={CardEntrance.duration(MOTION_TOKENS.duration.base).delay(index * 50)} />
```

**Celebration pop (MEGA → `playful`, overshoot ≤ 1.2):**
```js
check.value = withSpring(MOTION_TOKENS.scale.celebrate, MOTION_TOKENS.spring.playful);
```

**Skeleton shimmer / spinner loop (continuous):**
```js
o.value = withRepeat(withSequence(
  withTiming(1,   { duration: MOTION_TOKENS.duration.slow }),
  withTiming(0.4, { duration: MOTION_TOKENS.duration.slow }),
), -1);
rotate.value = withRepeat(withTiming(360, { duration: MOTION_TOKENS.duration.pulse, easing: MOTION_TOKENS.easing.linear }), -1);
```

## 5. Hierarchy → spring preset

| Hierarchy | Preset (`MOTION_TOKENS.spring.…`) | Use for |
|---|---|---|
| QUICK | `tight` | icons, badges, checkboxes |
| STANDARD | `snappy` | buttons, forms, lists, cards (default) |
| STANDARD/MEGA | `smooth` | navigation, modals, spatial movement |
| MEGA | `playful` | success/empty-state celebrations only |

## 6. Token reference (RN keys, puente example)

| Group | Keys | Value type |
|---|---|---|
| duration | `…MotionDuration{Instant,Micro,Quick,Snappy,Base,Substantial,Slow,Xslow,Pulse,Toast,Dismiss}` | number (ms) |
| spring | `…MotionSpring{Tight,Snappy,Smooth,Playful}{Damping,Stiffness,Mass}` | number |
| easing | `…MotionEasing{Standard,Entrance,Exit,Linear}` | `[x1,y1,x2,y2]` |
| scale | `…MotionScale{Press,Micro,Entrance,Celebrate,Hover,Active}` | number |
| opacity | `…MotionOpacity{Interactive,Disabled,Backdrop,Entrance}` | number |

(`…` = `tkDliteSemantic`.)

## Rules for agents

- ✅ Read every animation value from `MOTION_TOKENS` (which reads from tokens). **Never** hardcode `300`, `withSpring(x, { damping: 5 })`, etc.
- ✅ Animate **`transform` + `opacity` only**. Never width/height/top/left/padding/margin/backgroundColor.
- ✅ Map spring intensity to hierarchy (`tight`/`snappy`/`smooth`/`playful`). Don't put `playful` on a secondary button.
- ✅ Keep overshoot ≤ `scale.celebrate` (1.2).
- ✅ Animations are non-blocking: respond to the gesture immediately, let the spring catch up.
- ✅ Honor reduced motion via `useMotion()` → `shouldAnimate === false` ⇒ render static (`duration.instant` = 0).
- ❌ Don't reach for the web `--tk-dlite-*` CSS vars in RN; use the `tkDliteSemanticMotion*` JS keys.
