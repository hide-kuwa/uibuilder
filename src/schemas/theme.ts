import { z } from 'zod';

export const themeTokensSchema = z.object({
  name: z.string(),
  brandId: z.string().optional(),
  colors: z.object({
    background: z.string(),
    surface: z.string(),
    primary: z.string(),
    secondary: z.string(),
    text: z.string(),
    border: z.string(),
  }),
  radius: z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    full: z.string(),
  }),
  spacing: z.object({
    xs: z.string(),
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
  }),
  typography: z.object({
    fontFamily: z.string(),
    baseSize: z.string(),
    headingScale: z.number(),
    weightRegular: z.string(),
    weightBold: z.string(),
  }),
});

export const themeDocSchema = themeTokensSchema.extend({
  version: z.literal(1),
});

export type ThemeTokens = z.infer<typeof themeTokensSchema>;
export type ThemeDoc = z.infer<typeof themeDocSchema>;
