import type { ComponentNode } from "@domain-components";
import fs from "fs";
import path from "path";

function jsxPropValue(val: any): string {
  if (typeof val === "string") return `"${val}"`;
  if (typeof val === "number" || typeof val === "boolean") return `{${val}}`;
  if (typeof val === "object") return `{${JSON.stringify(val)}}`;
  return `{${String(val)}}`;
}

function renderNode(node: ComponentNode): string {
  const tag = node.componentId;
  const propEntries = Object.entries(node.props || {}).map(
    ([k, v]) => `${k}=${jsxPropValue(v)}`
  );
  const userCodeEntries = Object.entries(node.userCode ?? {}).map(
    ([k, code]) => `${k}={${code}} // @user-code:${node.id}:${k}`
  );
  const allProps = [...propEntries, ...userCodeEntries].join(" ");
  const propsStr = allProps ? ` ${allProps}` : "";
  const children = (node.children ?? []).map(renderNode).join("\n");
  if (!children) {
    return `<${tag}${propsStr} />`;
  } else {
    return `<${tag}${propsStr}>
  ${children}
</${tag}>`;
  }
}

function collectUsed(nodes: ComponentNode[], used: Set<string>) {
  for (const n of nodes) {
    used.add(n.componentId);
    if (n.children) collectUsed(n.children, used);
  }
}

export function generateCodeFromTree(tree: ComponentNode[], outPath: string) {
  const used = new Set<string>();
  collectUsed(tree, used);
  const imports = `import { ${Array.from(used).join(", ")} } from "@/components";`;
  const body = tree.map(renderNode).join("\n");
  const code = `${imports}\n\nexport default function Page() {\n  return (\n    <>\n${body
    .split("\n")
    .map((l) => "      " + l)
    .join("\n")}\n    </>\n  );\n}\n`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, code, "utf-8");
}

if (require.main === module) {
  const input = process.argv[2];
  const out = process.argv[3];
  if (!input || !out) {
    console.error("Usage: ts-node generateCodeFromTree.ts <tree.json> <out.tsx>");
    process.exit(1);
  }
  const tree = JSON.parse(fs.readFileSync(input, "utf-8"));
  const outPath = path.resolve(process.cwd(), out);
  generateCodeFromTree(tree, outPath);
}
