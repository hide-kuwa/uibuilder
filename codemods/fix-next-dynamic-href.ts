/**
 * Codemod: fix-next-dynamic-href
 * ----------------------------------------
 * Usage:
 *   pnpm codemod:href
 *
 * Rewrites dynamic href strings in <Link> and router.push/replace
 * to template literals with encoded parameters.
 */

function parsePath(path) {
  const segments = [];
  const regex = /\[(\.\.\.)?([^\]/]+)\]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(path))) {
    if (match.index > lastIndex) {
      segments.push({ text: path.slice(lastIndex, match.index) });
    }
    segments.push({ text: '', param: match[2], catchAll: !!match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < path.length) {
    segments.push({ text: path.slice(lastIndex) });
  }
  return segments;
}

function buildTemplate(j, pathStr, scope, reports, loc) {
  const segs = parsePath(pathStr);
  const quasis = [];
  const exprs = [];
  quasis.push(j.templateElement({ cooked: segs[0].text, raw: segs[0].text }));
  for (let i = 1; i < segs.length; i++) {
    const seg = segs[i];
    if (seg.param) {
      let id;
      if (scope.lookup && scope.lookup(seg.param)) {
        id = j.identifier(seg.param);
      } else {
        id = j.stringLiteral('__MISSING_PARAM__');
        id.comments = [j.commentLine(' TODO(codemod): 確認して埋めてください')];
        reports.push(`missing param "${seg.param}" at ${loc.start.line}:${loc.start.column}`);
      }
      let expr;
      if (seg.catchAll) {
        expr = j.callExpression(
          j.memberExpression(
            j.callExpression(
              j.memberExpression(id, j.identifier('map')),
              [
                j.arrowFunctionExpression(
                  [j.identifier('s')],
                  j.callExpression(j.identifier('encodeURIComponent'), [j.identifier('s')])
                ),
              ]
            ),
            j.identifier('join')
          ),
          [j.stringLiteral('/')]
        );
      } else {
        expr = j.callExpression(j.identifier('encodeURIComponent'), [id]);
      }
      exprs.push(expr);
      const nextText = segs[i].text || '';
      quasis.push(j.templateElement({ cooked: nextText, raw: nextText }));
    }
  }
  return j.templateLiteral(quasis, exprs);
}

function replaceStringLiteral(j, literal, scope, reports, loc) {
  const value = literal.value || literal.cooked || '';
  if (!value.includes('[')) return literal;
  return buildTemplate(j, value, scope, reports, loc);
}

function transformHrefAttribute(j, attr, scope, reports) {
  const val = attr.value;
  if (!val) return;
  if (val.type === 'StringLiteral' || (val.type === 'Literal' && typeof val.value === 'string')) {
    const loc = val.loc || attr.loc;
    const tpl = replaceStringLiteral(j, val, scope, reports, loc);
    if (tpl !== val) {
      attr.value = j.jsxExpressionContainer(tpl);
    }
  } else if (val.type === 'JSXExpressionContainer') {
    const expr = val.expression;
    if (expr.type === 'ObjectExpression') {
      const pathnameProp = expr.properties.find(
        p =>
          p.type === 'ObjectProperty' &&
          ((p.key.type === 'Identifier' && p.key.name === 'pathname') ||
            (p.key.type === 'StringLiteral' && p.key.value === 'pathname'))
      );
      if (pathnameProp && pathnameProp.value.type === 'StringLiteral') {
        const loc = pathnameProp.value.loc || attr.loc;
        const tpl = replaceStringLiteral(j, pathnameProp.value, scope, reports, loc);
        if (tpl !== pathnameProp.value) {
          pathnameProp.value = tpl;
          const params = parsePath(pathnameProp.value.quasis.map(q => q.value.raw).join(''))
            .filter(s => s.param)
            .map(s => s.param);
          const queryProp = expr.properties.find(
            p =>
              p.type === 'ObjectProperty' &&
              ((p.key.type === 'Identifier' && p.key.name === 'query') ||
                (p.key.type === 'StringLiteral' && p.key.value === 'query'))
          );
          if (queryProp && queryProp.value.type === 'ObjectExpression') {
            queryProp.value.properties = queryProp.value.properties.filter(p => {
              const keyName = p.key.type === 'Identifier' ? p.key.name : p.key.value;
              return !params.includes(keyName);
            });
          }
        }
      }
    }
  }
}

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const reports = [];

  const linkNames = new Set();
  root
    .find(j.ImportDeclaration, { source: { value: 'next/link' } })
    .forEach(p => {
      (p.value.specifiers || []).forEach(s => {
        if (s.local && s.local.name) linkNames.add(s.local.name);
      });
    });

  root.find(j.JSXOpeningElement).forEach(p => {
    const name = p.value.name && p.value.name.name;
    if (linkNames.has(name)) {
      const attr = (p.value.attributes || []).find(
        a => a.type === 'JSXAttribute' && a.name.name === 'href'
      );
      if (attr) {
        transformHrefAttribute(j, attr, p.scope, reports);
      }
    }
  });

  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: n => n === 'push' || n === 'replace' },
      },
    })
    .forEach(p => {
      const obj = p.value.callee.object;
      if (obj.type === 'Identifier' && /router$/i.test(obj.name)) {
        const arg = p.value.arguments[0];
        if (!arg) return;
        if (arg.type === 'StringLiteral' || (arg.type === 'Literal' && typeof arg.value === 'string')) {
          const tpl = replaceStringLiteral(j, arg, p.scope, reports, arg.loc || p.value.loc);
          if (tpl !== arg) {
            p.value.arguments[0] = tpl;
          }
        }
      }
    });

  if (reports.length) {
    console.error(`\n[fix-next-dynamic-href] ${file.path}`);
    reports.forEach(r => console.error('  ' + r));
  }

  return root.toSource({ quote: 'single' });
};

