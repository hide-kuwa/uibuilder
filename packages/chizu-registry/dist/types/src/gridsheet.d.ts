export type GridColumnType = 'text' | 'number' | 'date';
export interface GridColumn {
    key: string;
    label: string;
    type: GridColumnType;
    required?: boolean;
    validate?: string;
}
export interface GridSchema {
    columns: GridColumn[];
    footer?: {
        sum?: string[];
    };
}
