export type PaletteRule = {
  groups?: string[];        // 例: ['Basics','Maps'] だけ表示
  include?: string[];       // 追加で個別IDを表示（優先）
  exclude?: string[];       // これらのIDは非表示
};

export type ChromePreset = {
  header: boolean;          // ヘッダー表示
  footer: boolean;          // フッター表示
};

export type UIPreset = {
  id: string;
  name: string;
  palette: PaletteRule;
  chrome: ChromePreset;
  // 拡張余地: defaultProps: Record<string, Record<string, any>> など
};
