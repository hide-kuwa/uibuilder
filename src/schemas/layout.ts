import { z } from 'zod';

const paneSchema = z.object({
  width: z.number(),
  collapsed: z.boolean(),
});

const statusSchema = z.object({
  height: z.number(),
  visible: z.boolean(),
});

export const layoutTemplateSchema = z.object({
  version: z.literal(1),
  left: paneSchema,
  right: paneSchema,
  status: statusSchema,
  rightSections: z.record(z.boolean()).optional(),
  lastResetAt: z.number().optional(),
});

export type LayoutTemplate = z.infer<typeof layoutTemplateSchema>;
