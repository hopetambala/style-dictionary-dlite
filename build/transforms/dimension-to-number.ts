import StyleDictionary from 'style-dictionary';

const REM_BASE = 16;

StyleDictionary.registerTransform({
  name: 'value/dimension-to-number',
  type: 'value',
  transitive: true,
  filter: (token: any) => token.$type === 'dimension',
  transform: (token: any) => {
    const val = token.$value ?? token.value;
    if (typeof val !== 'string') return val;

    const match = val.match(/^(-?[\d.]+)(px|rem)$/);
    if (!match) return val;

    const num = parseFloat(match[1]);
    const unit = match[2];
    return unit === 'rem' ? num * REM_BASE : num;
  },
});
