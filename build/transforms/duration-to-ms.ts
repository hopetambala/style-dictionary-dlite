import StyleDictionary from 'style-dictionary';

StyleDictionary.registerTransform({
  name: 'value/duration-to-ms',
  type: 'value',
  transitive: true,
  filter: (token: any) => token.$type === 'duration',
  transform: (token: any) => {
    const val = token.$value ?? token.value;
    if (typeof val !== 'string') return val;

    const matchS = val.match(/^(-?[\d.]+)s$/);
    if (matchS) return parseFloat(matchS[1]) * 1000;

    const matchMs = val.match(/^(-?[\d.]+)ms$/);
    if (matchMs) return parseFloat(matchMs[1]);

    return val;
  },
});
