import { template, types as t } from '@babel/core';

const buildImportSideEffect = template(`require(SOURCE)`);
const buildImportRequire = template(`const ID = require(SOURCE)`);
const buildImportDefault = template(`const LOCAL = ID.default`);
const buildImportNamespace = template(`const LOCAL = ID`);
const buildImportNormal = template(`const LOCAL = ID.IMPORTED`);
const buildExport = template(`EXPORTS.NAME = VALUE`);
const buildExportNamespace = template(`
const ID = require(SOURCE);

for (let k in ID) {
  if (k === 'default') continue;
  EXPORTS[k] = ID[k];
}
`);

function transformImportDeclaration(path) {
  const { node } = path;
  if (node.specifiers.length === 0) {
    path.replaceWith(buildImportSideEffect({ SOURCE: node.source }));
    return;
  }

  const replacements = [];
  let buildId;
  if (node.specifiers.length === 1) {
    buildId = { ID: t.callExpression(t.identifier('require'), [node.source]) };
  } else {
    buildId = { ID: path.scope.generateUidIdentifier(node.source.value) };
    replacements.push(buildImportRequire({ ...buildId, SOURCE: node.source }));
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const specifier of node.specifiers) {
    switch (specifier.type) {
      case 'ImportDefaultSpecifier':
        replacements.push(buildImportDefault({ ...buildId, LOCAL: specifier.local }));
        break;
      case 'ImportNamespaceSpecifier':
        replacements.push(buildImportNamespace({ ...buildId, LOCAL: specifier.local }));
        break;
      case 'ImportSpecifier':
        replacements.push(
          buildImportNormal({ ...buildId, LOCAL: specifier.local, IMPORTED: specifier.imported }),
        );
        break;
    }
  }

  replacements.forEach(r => {
    r._blockHoist = 2;
  });

  path.replaceWithMultiple(replacements);
}

function transformExportNamedDeclaration(path, exports) {
  const { node } = path;
  if (node.declaration) {
    // export const ...
    const ids =
      node.declaration.type === 'VariableDeclaration'
        ? node.declaration.declarations.map(d => d.id)
        : [node.declaration.id];

    const exportAssignments = ids.map(id =>
      t.expressionStatement(t.assignmentExpression('=', t.memberExpression(exports, id), id)),
    );

    path.replaceWithMultiple([node.declaration, ...exportAssignments]);
  } else {
    // export {...}
    let getLocal = local => local;
    if (node.source != null) {
      // export {...} from '...'
      const id = path.scope.generateUidIdentifier(node.source.value);
      path.insertBefore(buildImportRequire({ ID: id, SOURCE: node.source }));
      getLocal = local => t.memberExpression(id, local);
    }

    const exportAssignments = node.specifiers.map(({ exported, local }) =>
      t.expressionStatement(
        t.assignmentExpression('=', t.memberExpression(exports, exported), getLocal(local)),
      ),
    );
    path.replaceWithMultiple(exportAssignments);
  }
}

export default () => ({
  visitor: {
    Program: {
      exit(path) {
        let hasExports = false;
        const exports = path.scope.generateUidIdentifier('exports');

        path.traverse({
          ImportDeclaration(p) {
            transformImportDeclaration(p);
          },
          ExportAllDeclaration(p) {
            hasExports = true;
            const id = path.scope.generateUidIdentifier(p.node.source.value);
            p.replaceWithMultiple(
              buildExportNamespace({ ID: id, SOURCE: p.node.source, EXPORTS: exports }),
            );
          },
          ExportNamedDeclaration(p) {
            hasExports = true;
            transformExportNamedDeclaration(p, exports);
          },
          ExportDefaultDeclaration(p) {
            hasExports = true;
            p.replaceWith(
              buildExport({ EXPORTS: exports, NAME: 'default', VALUE: p.node.declaration }),
            );
          },
        });

        if (hasExports) {
          path.node.body.unshift(
            t.variableDeclaration('const', [t.variableDeclarator(exports, t.objectExpression([]))]),
          );
          path.node.body.push(t.returnStatement(exports));
        } else {
          path.node.body.push(t.returnStatement(t.objectExpression([])));
        }
      },
    },
  },
});
