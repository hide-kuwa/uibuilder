#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const t = require('@babel/types');
const generate = require('@babel/generator').default;

function parseArgs() {
  const args = process.argv.slice(2);
  let inFile;
  let outFile;
  let componentName = 'GeneratedPage';
  let registry = './components';
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--in') {
      inFile = args[++i];
    } else if (arg === '--out') {
      outFile = args[++i];
    } else if (arg === '--component-name') {
      componentName = args[++i];
    } else if (arg === '--registry') {
      registry = args[++i];
    } else {
      console.error(`Unknown argument: ${arg}`);
      console.error('Usage: json2tsx --in <file> --out <file> --component-name <name> [--registry <importPath>]');
      process.exit(1);
    }
  }
  return { inFile, outFile, componentName, registry };
}

function valueToJsx(value) {
  if (typeof value === 'string') {
    return t.stringLiteral(value);
  }
  return t.jsxExpressionContainer(t.valueToNode(value));
}

function buildElement(node, imports) {
  const type = node.type;
  const props = node.props || {};
  const children = node.children || [];
  imports.add(type);

  const attrs = Object.entries(props).map(([key, val]) =>
    t.jsxAttribute(t.jsxIdentifier(key), valueToJsx(val))
  );

  const childNodes = children.map((c) => buildElement(c, imports));
  const opening = t.jsxOpeningElement(t.jsxIdentifier(type), attrs, childNodes.length === 0);
  const closing = childNodes.length === 0 ? null : t.jsxClosingElement(t.jsxIdentifier(type));
  return t.jsxElement(opening, closing, childNodes, childNodes.length === 0);
}

async function main() {
  const { inFile, outFile, componentName, registry } = parseArgs();
  try {
    const jsonStr = inFile ? await fs.promises.readFile(inFile, 'utf8') : await new Promise((res, rej) => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk) => (data += chunk));
      process.stdin.on('end', () => res(data));
      process.stdin.on('error', rej);
    });
    const json = JSON.parse(jsonStr);
    const imports = new Set();
    const jsx = buildElement(json, imports);

    const reactImport = t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier('React'))],
      t.stringLiteral('react')
    );

    const importSpecifiers = Array.from(imports).sort().map((name) =>
      t.importSpecifier(t.identifier(name), t.identifier(name))
    );
    const registryImport = t.importDeclaration(importSpecifiers, t.stringLiteral(registry));

    const propsInterface = t.tsInterfaceDeclaration(
      t.identifier(`${componentName}Props`),
      null,
      [],
      t.tsInterfaceBody([])
    );
    const exportedProps = t.exportNamedDeclaration(propsInterface, []);

    const param = t.identifier('props');
    param.typeAnnotation = t.tsTypeAnnotation(
      t.tsTypeReference(t.identifier(`${componentName}Props`))
    );
    const func = t.functionDeclaration(
      t.identifier(componentName),
      [param],
      t.blockStatement([t.returnStatement(jsx)])
    );

    const exportDefault = t.exportDefaultDeclaration(t.identifier(componentName));

    const program = t.program([
      reactImport,
      registryImport,
      exportedProps,
      func,
      exportDefault,
    ]);

    const generated = generate(program, { jsescOption: { minimal: true } }).code;
    const formatted = await prettier.format(generated, { parser: 'typescript' });

    if (outFile) {
      await fs.promises.mkdir(path.dirname(outFile), { recursive: true });
      await fs.promises.writeFile(outFile, formatted, 'utf8');
    } else {
      process.stdout.write(formatted);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
