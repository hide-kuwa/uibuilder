import type { Page, Frame } from '@chizu/types';
export interface CodegenOptions {
    page: Page;
    frame?: Frame;
    registryImport?: string;
    componentVarPrefix?: string;
    includeMeta?: boolean;
}
export declare function generatePageCode(opts: CodegenOptions): {
    tsx: string;
    fileName: string;
    stableKey: string;
};
