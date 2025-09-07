export type GridColumnType = 'text' | 'number' | 'date';

export interface GridColumn {
  key: string;
  label: string;
  type: GridColumnType;
  required?: boolean;
  validate?: string; // 式（将来evalFormulaに接続）
}

export interface GridSchema {
  columns: GridColumn[];
  footer?: { sum?: string[] }; // 合計を出す number列のキー配列
}

