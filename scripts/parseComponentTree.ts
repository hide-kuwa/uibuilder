import { Project, SyntaxKind } from "ts-morph";
import path from "path";
import fs from "fs";

export type ComponentNode = {
  id: string;
  componentId: string;
  props: Record<string, any>;
  children?: ComponentNode[];
  userCode?: Record<string, string>;
};

function parseJsxElement(el: any): ComponentNode | null {
  if (!el) return null;

  const isSelf = el.getKind() === SyntaxKind.JsxSelfClosingElement;
  const tagNode = isSelf
    ? el.getTagNameNode()
    : el.getOpeningElement().getTagNameNode();
  const componentId = tagNode.getText();
  const attrs = isSelf ? el.getAttributes() : el.getOpeningElement().getAttributes();
  const props: Record<string, any> = {};
  const userCode: Record<string, string> = {};
  attrs.forEach((attr: any) => {
    if (attr.getKind() === SyntaxKind.JsxAttribute) {
      const name = attr.getNameNode().getText();
      const initializer = attr.getInitializer();
      if (initializer) {
        if (initializer.getKind() === SyntaxKind.StringLiteral) {
          props[name] = initializer.getLiteralText();
        } else if (initializer.getKind() === SyntaxKind.JsxExpression) {
          const expr = initializer.getExpression();
          const comment = attr.getTrailingCommentRanges?.()[0];
          const commentText = comment?.getText?.() ?? "";
          if (commentText.includes("@user-code:")) {
            userCode[name] = expr?.getText() || "";
          } else if (expr) {
            props[name] = expr.getText();
          }
        }
      }
    }
  });

  const children: ComponentNode[] = [];
  const childEls = isSelf
    ? []
    : el.getChildrenOfKind(SyntaxKind.JsxElement).concat(
        el.getChildrenOfKind(SyntaxKind.JsxSelfClosingElement)
      );
  childEls.forEach((childEl: any) => {
    const c = parseJsxElement(childEl);
    if (c) children.push(c);
  });

  return {
    id: "id_" + Math.random().toString(36).slice(2, 8),
    componentId,
    props,
    children: children.length ? children : undefined,
    userCode: Object.keys(userCode).length ? userCode : undefined,
  };
}

export function parseComponentTreeFromFile(filePath: string): ComponentNode[] {
  const project = new Project({ tsConfigFilePath: "tsconfig.json" });
  const source = project.addSourceFileAtPath(filePath);
  const rootJsx = source.getDescendantsOfKind(SyntaxKind.JsxElement)[0];

  const root = parseJsxElement(rootJsx);
  return root ? [root] : [];
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: ts-node parseComponentTree.ts <file>");
    process.exit(1);
  }
  const fp = path.resolve(process.cwd(), target);
  const tree = parseComponentTreeFromFile(fp);
  fs.writeFileSync("componentTree.json", JSON.stringify(tree, null, 2));
}
