import { pageDocSchema, type PageDoc } from '../../schemas/page';
import { ZodError } from 'zod';

export const PAGE_VERSION = 1;

// migratePage converts legacy page JSON to the latest PageDoc format.
export function migratePage(json: any): PageDoc {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid page data');
  }
  const v = json.version ?? 0;
  if (v === PAGE_VERSION) {
    return parse(json);
  }
  if (v === 0) {
    return parse({
      id: json.id ?? '',
      title: json.title ?? '',
      path: json.path ?? '/',
      tree: Array.isArray(json.tree) ? json.tree : [],
      bindings: typeof json.bindings === 'object' && json.bindings ? json.bindings : {},
      pageOverrides: typeof json.pageOverrides === 'object' && json.pageOverrides ? json.pageOverrides : {},
      meta: typeof json.meta === 'object' && json.meta ? json.meta : {},
      version: PAGE_VERSION,
    });
  }
  throw new Error(`Unsupported page version: ${v}`);
}

function parse(doc: unknown): PageDoc {
  try {
    return pageDocSchema.parse(doc);
  } catch (err) {
    if (err instanceof ZodError) {
      const msg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(msg);
    }
    throw err;
  }
}
