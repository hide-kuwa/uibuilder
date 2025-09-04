import { z } from 'zod';
import { themeTokensSchema } from './theme';

export interface BuilderNode {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: BuilderNode[];
}

export const builderNodeSchema: z.ZodType<BuilderNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.any()).optional(),
    children: z.array(builderNodeSchema).optional(),
  })
);

export const pageSnapshotSchema = z.object({
  version: z.literal(1),
  pageId: z.string(),
  layoutId: z.string(),
  effectiveTheme: themeTokensSchema,
  nodes: z.array(builderNodeSchema),
  timestamp: z.number(),
});
export type PageSnapshot = z.infer<typeof pageSnapshotSchema>;

export const pageDocSchema = z.object({
  id: z.string(),
  title: z.string(),
  path: z.string(),
  tree: z.array(z.any()),
  bindings: z.record(z.any()),
  pageOverrides: z.object({ theme: themeTokensSchema.partial().optional() }).default({}),
  version: z.literal(1),
});
export type PageDoc = z.infer<typeof pageDocSchema>;
