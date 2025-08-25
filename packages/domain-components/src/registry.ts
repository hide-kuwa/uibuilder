import { z } from "zod";
import type { Registry as RegistryType } from "./types";

export const Registry: RegistryType = {
  TextBlock: {
    id: "TextBlock",
    displayName: "Text",
    tags: ["basic", "content"],
    propsSchema: z.object({
      text: z.string().default("Hello"),
      as: z.enum(["p", "h1", "h2", "h3", "span"]).default("p"),
      align: z.enum(["left", "center", "right"]).default("left"),
      className: z.string().optional(),
    }),
    defaultProps: { text: "Hello", as: "p", align: "left" },
    load: () => import("./components/TextBlock").then((m) => m.TextBlock),
  },
  ImageBlock: {
    id: "ImageBlock",
    displayName: "Image",
    tags: ["basic", "media"],
    propsSchema: z.object({
      src: z.string().url().default("https://placehold.co/600x400"),
      alt: z.string().default("image"),
      width: z.number().int().positive().default(600),
      height: z.number().int().positive().default(400),
      fit: z
        .enum(["cover", "contain", "fill", "none", "scale-down"])
        .default("cover"),
      className: z.string().optional(),
    }),
    defaultProps: {
      src: "https://placehold.co/600x400",
      alt: "image",
      width: 600,
      height: 400,
      fit: "cover",
    },
    load: () => import("./components/ImageBlock").then((m) => m.ImageBlock),
  },
  Button: {
    id: "Button",
    displayName: "Button",
    tags: ["basic", "action"],
    propsSchema: z.object({
      label: z.string().default("Click me"),
      variant: z.enum(["solid", "outline", "ghost"]).default("solid"),
      className: z.string().optional(),
    }),
    defaultProps: { label: "Click me", variant: "solid" },
    events: { onClick: z.object({}).optional() },
    load: () => import("./components/Button").then((m) => m.Button),
  },
};
