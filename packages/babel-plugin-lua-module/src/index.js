import { types as t } from '@babel/core';

export default function() {
  return {
    visitor: {
      Program(path) {
        const moduleExports = t.memberExpression(t.identifier('module'), t.identifier('exports'));

        const moduleDeclaration = t.objectExpression([
          t.objectProperty(t.identifier('exports'), t.objectExpression([])),
        ]);
        moduleDeclaration._compact = true;

        path.node.body.unshift(
          t.variableDeclaration('var', [
            t.variableDeclarator(t.identifier('module'), moduleDeclaration),
            t.variableDeclarator(t.identifier('exports'), moduleExports),
          ]),
        );
        path.node.body.push(t.returnStatement(moduleExports));
      },
    },
  };
}
