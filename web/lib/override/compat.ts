import type { ComponentDefinition, ComponentNode } from "@/types/editor";

function collect(node: ComponentNode, acc: Record<string, ComponentNode>) {
  acc[node.id] = node;
  if (node.children) {
    for (const c of node.children) collect(c, acc);
  }
}

export function isCompatible(
  a: ComponentDefinition,
  b: ComponentDefinition,
): boolean {
  const mapA: Record<string, ComponentNode> = {};
  const mapB: Record<string, ComponentNode> = {};
  collect(a.root, mapA);
  collect(b.root, mapB);
  for (const id of Object.keys(mapA)) {
    if (mapB[id] && mapB[id].type !== mapA[id].type) return false;
  }
  return true;
}

export function migrateOverrides(
  overrides: Record<string, Partial<ComponentNode>> | undefined,
  from: ComponentDefinition,
  to: ComponentDefinition,
): Record<string, Partial<ComponentNode>> | undefined {
  if (!overrides) return undefined;
  const mapFrom: Record<string, ComponentNode> = {};
  const mapTo: Record<string, ComponentNode> = {};
  collect(from.root, mapFrom);
  collect(to.root, mapTo);
  const res: Record<string, Partial<ComponentNode>> = {};
  Object.entries(overrides).forEach(([id, patch]) => {
    const src = mapFrom[id];
    const dst = mapTo[id];
    if (!src || !dst || src.type !== dst.type) return;
    const out: Partial<ComponentNode> = {};
    if ("text" in patch) (out as any).text = (patch as any).text;
    if (patch.props) {
      const props: any = {};
      ["visible", "fill", "stroke", "color", "text"].forEach((k) => {
        if (patch.props && (patch.props as any)[k] !== undefined)
          props[k] = (patch.props as any)[k];
      });
      if (Object.keys(props).length) out.props = props;
    }
    if ((patch as any).style) {
      const style: any = {};
      if ((patch as any).style.color !== undefined)
        style.color = (patch as any).style.color;
      if (Object.keys(style).length) (out as any).style = style;
    }
    if (Object.keys(out).length) res[id] = out;
  });
  return Object.keys(res).length ? res : undefined;
}
