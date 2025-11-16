/**
 * convert-styled-jsx-to-cssmodule.js
 *
 * Usage:
 *   npx jscodeshift -t scripts/convert-styled-jsx-to-cssmodule.js src --extensions=js,jsx,ts,tsx --parser=tsx
 *
 * Notes:
 * - Creates <FileName>.module.css next to the processed file.
 * - Replaces className="a b" -> className={`${styles.a} ${styles.b}`}
 * - Leaves dynamic className expressions alone (no attempt to convert).
 */

const fs = require('fs');
const path = require('path');

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let found = false;
  let cssTextCombined = '';

  // find <style jsx>{`...`}</style>
  root.find(j.JSXElement).forEach(pathNode => {
    const node = pathNode.node;
    if (
      node.openingElement &&
      node.openingElement.name &&
      node.openingElement.name.name === 'style'
    ) {
      // check for jsx attribute ( <style jsx> )
      const hasJsxAttr =
        node.openingElement.attributes &&
        node.openingElement.attributes.some(attr => {
          return (
            attr &&
            ((attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'jsx') ||
              (attr.type === 'JSXSpreadAttribute' && true))
          );
        });

      if (!hasJsxAttr) return;

      // children could be JSXExpressionContainer with TemplateLiteral or Literal
      const children = node.children || [];
      children.forEach(child => {
        if (!child) return;
        if (child.type === 'JSXExpressionContainer') {
          const expr = child.expression;
          if (!expr) return;
          if (expr.type === 'TemplateLiteral') {
            const raw = expr.quasis.map(q => q.value.cooked).join('');
            cssTextCombined += raw + '\n';
            found = true;
          } else if (expr.type === 'Literal' || expr.type === 'StringLiteral') {
            cssTextCombined += expr.value + '\n';
            found = true;
          }
        } else if (child.type === 'Literal' || child.type === 'JSXText') {
          cssTextCombined += child.value || child.raw || '' + '\n';
          found = true;
        }
      });

      // remove the style element from the JSX
      j(pathNode).remove();
    }
  });

  if (!found) return null; // nothing to do

  // Determine css file name (File.module.css)
  const srcPath = fileInfo.path;
  const dirname = path.dirname(srcPath);
  const basename = path.basename(srcPath).replace(/\.(jsx|tsx|js|ts)$/, '');
  const cssFileName = `${basename}.module.css`;
  const cssFilePath = path.join(dirname, cssFileName);

  // Write the CSS file (append if exists)
  try {
    if (fs.existsSync(cssFilePath)) {
      // append to existing file to preserve previous conversions
      const prev = fs.readFileSync(cssFilePath, 'utf8');
      if (!prev.includes(cssTextCombined.trim())) {
        fs.writeFileSync(cssFilePath, prev + '\n\n' + cssTextCombined, 'utf8');
      }
    } else {
      fs.writeFileSync(cssFilePath, cssTextCombined, 'utf8');
    }
  } catch (e) {
    console.error('Error writing CSS file:', cssFilePath, e);
  }

  // Inject import styles from './X.module.css' at top if not already imported
  const importPath = `./${cssFileName}`;
  const hasImport = root.find(j.ImportDeclaration, {
    source: { value: importPath }
  }).size();

  if (!hasImport) {
    const importDecl = j.importDeclaration(
      [j.importDefaultSpecifier(j.identifier('styles'))],
      j.literal(importPath)
    );
    // add at top (before other imports) or at program start
    const firstImport = root.find(j.ImportDeclaration).at(0);
    if (firstImport.size()) {
      firstImport.insertBefore(importDecl);
    } else {
      root.get().node.program.body.unshift(importDecl);
    }
  }

  // Replace static className="a b" with className={`${styles.a} ${styles.b}`}
  root.find(j.JSXAttribute, { name: { name: 'className' } }).forEach(attrPath => {
    const attr = attrPath.node;
    if (!attr || !attr.value) return;

    // only handle plain string literal className
    if (attr.value.type === 'Literal' || attr.value.type === 'StringLiteral') {
      const classStr = attr.value.value || attr.value.raw || '';
      const classNames = classStr
        .split(/\s+/)
        .map(s => s.trim())
        .filter(Boolean);
      if (classNames.length === 0) return;

      // build template string: `${styles.a} ${styles.b}`
      const parts = [];
      classNames.forEach((cn, i) => {
        // safe CSS classname -> JS identifier fallback (if contains - , we access styles['a-b'])
        if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cn)) {
          parts.push(j.templateElement({ raw: '', cooked: '' }, false));
          // we will build expression pieces below
        } else {
          // nothing special, handle as bracket access
        }
      });

      // Build expression: className={styles.foo} or className={`${styles.a} ${styles.b}`}
      if (classNames.length === 1) {
        const cn = classNames[0];
        let expr;
        if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cn)) {
          expr = j.memberExpression(j.identifier('styles'), j.identifier(cn));
        } else {
          expr = j.memberExpression(
            j.identifier('styles'),
            j.literal(cn),
            true // computed
          );
        }
        attrPath.replace(
          j.jsxAttribute(j.jsxIdentifier('className'), j.jsxExpressionContainer(expr))
        );
      } else {
        // multiple classes -> build template literal with expressions and spaces
        // create TemplateLiteral parts and expressions arrays
        const quasis = [];
        const expressions = [];
        classNames.forEach((cn, idx) => {
          // add cooked text for leading space if not first
          const rawText = idx === 0 ? '' : ' ';
          quasis.push(j.templateElement({ raw: rawText, cooked: rawText }, false));
          // expression for styles.NAME
          let exp;
          if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cn)) {
            exp = j.memberExpression(j.identifier('styles'), j.identifier(cn));
          } else {
            exp = j.memberExpression(j.identifier('styles'), j.literal(cn), true);
          }
          expressions.push(exp);
        });
        // add final empty tail
        quasis.push(j.templateElement({ raw: '', cooked: '' }, true));

        const template = j.templateLiteral(quasis, expressions);
        attrPath.replace(
          j.jsxAttribute(
            j.jsxIdentifier('className'),
            j.jsxExpressionContainer(template)
          )
        );
      }
    }
    // else: attribute value is JSXExpression -> leave untouched (dynamic)
  });

  return root.toSource({ quote: 'single', trailingComma: true });
};
