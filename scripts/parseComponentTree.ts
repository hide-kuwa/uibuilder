import { Project, SyntaxKind, JsxElement, JsxSelfClosingElement, JsxAttribute } from "ts-morph";
import path from "path";
import fs from "fs";

export type PropValue =
  | string
  | number
  | boolean
  | { __expr: string };

export type ComponentNode = {
  id: string;
  componentId: string;
  props: Record<string, PropValue>;
  userCode?: Record<string, string>;
  children?: ComponentNode[];
};

function parseJsxElement(el: JsxElement | JsxSelfClosingElement): ComponentNode | null {
  if (!el) return null;

  const isSelfClosing = el.getKind() === SyntaxKind.JsxSelfClosingElement;
  const tagNode = isSelfClosing
    ? (el as JsxSelfClosingElement).getTagNameNode()
    : (el as JsxElement).getOpeningElement().getTagNameNode();
  const componentId = tagNode.getText();

  const attrs = isSelfClosing
    ? (el as JsxSelfClosingElement).getAttributes()
    : (el as JsxElement).getOpeningElement().getAttributes();

  const props: Record<string, PropValue> = {};
  const userCode: Record<string, string> = {};

  attrs.forEach((attr) => {
    if (attr.getKind() !== SyntaxKind.JsxAttribute) return;

    const name = (attr as JsxAttribute).getNameNode().getText();
    const initializer = (attr as JsxAttribute).getInitializer();

    if (!initializer) return;

    if (initializer.getKind() === SyntaxKind.StringLiteral) {
      props[name] = initializer.getLiteralText();
    } else if (initializer.getKind() === SyntaxKind.JsxExpression) {
      const expr = initializer.getExpression();
      const exprText = expr?.getText();
      if (!exprText) return;

      // チェック：user-codeかどうか（コメントに含まれているか）
      const trailingTrivia = attr.getTrailingTrivia();
      const isUserCode = trailingTrivia?.includes("@user-code:");

      if (isUserCode) {
        userCode[name] = exprText;
      } else {
        props[name] = { __expr: exprText };
      }
    }
  });

  // 子ノードの再帰処理（JsxElement, JsxSelfClosingElement 両方）
  const children: ComponentNode[] = [];
  const childEls = isSelfClosing
    ? []
    : [
        ...(el as JsxElement).getChildrenOfKind(SyntaxKind.JsxElement),
        ...(el as JsxElement).getChildrenOfKind(SyntaxKind.JsxSelfClosingElement),
      ];

  childEls.forEach((childEl) => {
    const child = parseJsxElement(childEl);
    if (child) children.push(child);
  });

  return {
    id: "id_" + Math.random().toString(36).slice(2, 8),
    componentId,
    props,
    userCode: Object.keys(userCode).length ? userCode : undefined,
    children: children.length ? children : undefined,
  };
}

export function parseComponentTreeFromFile(filePath: string): ComponentNode[] {
  const project = new Project({ tsConfigFilePath: "tsconfig.json" });
  const source = project.addSourceFileAtPath(filePath);
  const jsxRoots = source.getDescendantsOfKind(SyntaxKind.JsxElement);

  if (!jsxRoots.length) return [];

  const root = parseJsxElement(jsxRoots[0]);
  return root ? [root] : [];
}

// CLI usage
if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: ts-node parseComponentTree.ts <file>");
    process.exit(1);
  }
  const fp = path.resolve(process.cwd(), target);
  const tree = parseComponentTreeFromFile(fp);
  const outFile = process.argv[3] ?? "componentTree.json";
  fs.writeFileSync(outFile, JSON.stringify(tree, null, 2));
  console.log(`✅ Exported to ${outFile}`);
}
