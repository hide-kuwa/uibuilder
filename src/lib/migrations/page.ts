export const PAGE_VERSION = 1;

export interface PageDoc {
  id: string;
  title: string;
  path: string;
  tree: any[];
  bindings: Record<string, unknown>;
  pageOverrides: { theme?: Record<string, any> };
  version: number;
}

// migratePage converts legacy page JSON to the latest PageDoc format.
export function migratePage(json: any): PageDoc {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid page data');
  }
  const v = json.version ?? 0;
  if (v === PAGE_VERSION) {
    return json as PageDoc;
  }
  if (v === 0) {
    return {
      id: json.id ?? '',
      title: json.title ?? '',
      path: json.path ?? '/',
      tree: Array.isArray(json.tree) ? json.tree : [],
      bindings: typeof json.bindings === 'object' && json.bindings ? json.bindings : {},
      pageOverrides: typeof json.pageOverrides === 'object' && json.pageOverrides ? json.pageOverrides : {},
      version: PAGE_VERSION,
    };
  }
  throw new Error(`Unsupported page version: ${v}`);
}
