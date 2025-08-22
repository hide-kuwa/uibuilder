export type ExportKind = 'png' | 'svg' | 'html' | 'react';
export interface ExportOptions {
  kind: ExportKind;
  scale?: 1 | 2 | 3;
  transparent?: boolean;
  fileName?: string; // default: 'uibuilder-export'
  device?: 'desktop' | 'tablet' | 'mobile';
  includeTailwindCdn?: boolean; // html output option
}
