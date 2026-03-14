export type TokenNode = Record<string, unknown> & { $value: unknown };

export type TokenTree = {
  [key: string]: unknown;
};

export interface ThemeCombo {
  theme: string;
  mode: string;
}
