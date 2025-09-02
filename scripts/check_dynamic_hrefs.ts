import path from 'node:path';
import { Project, SyntaxKind, Node } from 'ts-morph';
import { spawnSync } from 'node:child_process';

const project = new Project({ tsConfigFilePath: path.join(__dirname, '..', 'tsconfig.json') });
project.addSourceFilesAtPaths('web/**/*.{ts,tsx}');

const problems: string[] = [];

for (const sf of project.getSourceFiles()) {
  sf.forEachDescendant(node => {
    if (Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node)) {
      const tag = node.getTagNameNode().getText();
      if (tag === 'Link') {
        let attr: any;
        for (const a of node.getAttributes()) {
          if (a.getKind() === SyntaxKind.JsxAttribute) {
            const name = (a as any).getNameNode().getText();
            if (name === 'href') {
              attr = a;
              break;
            }
          }
        }
        if (attr) {
          const init = attr.getInitializer();
          if (init) {
            if (Node.isStringLiteral(init) && init.getLiteralText().includes('[')) {
              problems.push(`${sf.getFilePath()}: <Link href="${init.getLiteralText()}">`);
            } else if (Node.isJsxExpression(init)) {
              const expr = init.getExpression();
              if (Node.isObjectLiteralExpression(expr)) {
                const prop = expr.getProperty('pathname');
                if (prop && Node.isPropertyAssignment(prop)) {
                  const lit = prop.getInitializerIfKind(SyntaxKind.StringLiteral);
                  if (lit && lit.getLiteralText().includes('[')) {
                    problems.push(`${sf.getFilePath()}: <Link href={{ pathname: "${lit.getLiteralText()}" }}>`);
                  }
                }
              }
            }
          }
        }
      }
    } else if (Node.isCallExpression(node)) {
      const exp = node.getExpression();
      if (
        Node.isPropertyAccessExpression(exp) &&
        ['push', 'replace'].includes(exp.getName()) &&
        exp.getExpression().getText().toLowerCase().includes('router')
      ) {
        const arg = node.getArguments()[0];
        if (arg) {
          if (Node.isStringLiteral(arg) && arg.getLiteralText().includes('[')) {
            problems.push(`${sf.getFilePath()}: router.${exp.getName()}("${arg.getLiteralText()}")`);
          } else if (Node.isObjectLiteralExpression(arg)) {
            const prop = arg.getProperty('pathname');
            if (prop && Node.isPropertyAssignment(prop)) {
              const lit = prop.getInitializerIfKind(SyntaxKind.StringLiteral);
              if (lit && lit.getLiteralText().includes('[')) {
                problems.push(`${sf.getFilePath()}: router.${exp.getName()}({ pathname: "${lit.getLiteralText()}" })`);
              }
            }
          }
        }
      }
    }
  });
}

if (problems.length) {
  console.error('Dynamic hrefs detected:\n' + problems.join('\n'));
}

const grep = spawnSync('grep', ['-R', '\[', 'web']);
if (grep.status === 0) {
  const text = grep.stdout.toString().split('\n').filter(line => /(href|router\.push|router\.replace|pathname)/.test(line));
  if (text.length) {
    console.error('grep detected possible dynamic segments:\n' + text.join('\n'));
    problems.push('grep');
  }
}

if (problems.length) {
  process.exit(1);
}
