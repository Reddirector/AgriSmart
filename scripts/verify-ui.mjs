import ts from 'typescript';
import { existsSync,readdirSync,readFileSync,statSync } from 'node:fs';
import { dirname,extname,join,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const srcRoot = join(root, 'src');
const files = [];
function walk(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (['.ts', '.tsx'].includes(extname(path))) files.push(path);
  }
}
walk(srcRoot);

const failures = [];
const staticIds = new Map();
const expectedRoutes = ['/farmer/crop-health', '/farmer/drones', '/farmer/farms'];
const appSource = readFileSync(join(srcRoot, 'App.tsx'), 'utf8');
const layoutSource = readFileSync(join(srcRoot, 'components/layout/DashboardLayout.tsx'), 'utf8');

for (const route of expectedRoutes) {
  const relative = route.replace('/farmer/', '');
  if (!appSource.includes(`path="${relative}"`) && route !== '/farmer/farms') failures.push(`Missing route ${route}`);
  if (!layoutSource.includes(`path: '${route}'`)) failures.push(`Missing navigation item ${route}`);
}

function resolvesLocalImport(fromFile, specifier) {
  const candidate = specifier.startsWith('@/')
    ? join(srcRoot, specifier.slice(2))
    : resolve(dirname(fromFile), specifier);
  return [candidate, `${candidate}.ts`, `${candidate}.tsx`, join(candidate, 'index.ts'), join(candidate, 'index.tsx')].some(existsSync);
}

function isHookCall(node) {
  return ts.isCallExpression(node)
    && ((ts.isIdentifier(node.expression) && /^use[A-Z]/.test(node.expression.text))
      || (ts.isPropertyAccessExpression(node.expression) && /^use[A-Z]/.test(node.expression.name.text)));
}

for (const file of files) {
  const sourceText = readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  for (const diagnostic of source.parseDiagnostics) failures.push(`${file}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);

  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const specifier = statement.moduleSpecifier.text;
      if ((specifier.startsWith('@/') || specifier.startsWith('.')) && !resolvesLocalImport(file, specifier)) failures.push(`${file}: unresolved import ${specifier}`);
    }
  }

  function inspect(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const name = node.tagName.getText(source);
      const attributes = new Map(node.attributes.properties.filter(ts.isJsxAttribute).map((attribute) => [attribute.name.getText(source), attribute]));
      if (name === 'button') {
        const type = attributes.get('type')?.initializer?.getText(source) || '';
        if (!attributes.has('onClick') && !attributes.has('onSubmit') && !type.includes('submit')) failures.push(`${file}:${source.getLineAndCharacterOfPosition(node.pos).line + 1}: actionless button`);
      }
      const id = attributes.get('id')?.initializer;
      if (id && ts.isStringLiteral(id)) {
        const prior = staticIds.get(id.text);
        if (prior && id.text !== 'main-content') failures.push(`Duplicate static id ${id.text}: ${prior} and ${file}`);
        staticIds.set(id.text, file);
      }
    }

    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
      const body = node.body;
      if (body && ts.isBlock(body)) {
        let sawReturn = false;
        for (const statement of body.statements) {
          if (ts.isReturnStatement(statement) || (ts.isIfStatement(statement) && ts.isReturnStatement(statement.thenStatement))) sawReturn = true;
          if (sawReturn) {
            let hookAfterReturn = false;
            const scan = (child) => { if (isHookCall(child)) hookAfterReturn = true; ts.forEachChild(child, scan); };
            scan(statement);
            if (hookAfterReturn) failures.push(`${file}:${source.getLineAndCharacterOfPosition(statement.pos).line + 1}: hook may run after an early return`);
          }
        }
      }
    }
    ts.forEachChild(node, inspect);
  }
  inspect(source);
}

const css = readFileSync(join(srcRoot, 'index.css'), 'utf8');
let braces = 0;
for (const character of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
  if (character === '{') braces += 1;
  if (character === '}') braces -= 1;
  if (braces < 0) failures.push('CSS contains a closing brace without an opening brace.');
}
if (braces !== 0) failures.push(`CSS brace balance is ${braces}.`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`UI verification passed across ${files.length} TypeScript files.`);
