import { types as t } from '@babel/core';

export default function() {
  return {
    visitor: {
      FunctionDeclaration(path) {
        const { node } = path;
        if (!node.generator) return;

        /* path.remove();
        path.scope.parent.push({ id: node.id, init: t.toExpression(node) }); */

        const declaration = t.variableDeclaration('const', [
          t.variableDeclarator(node.id, t.toExpression(node)),
        ]);
        node.id = null;

        // TODO: FunctionDeclaration in Lua has different scoping rules from JS, so hoisting it breaks helper
        // declaration._blockHoist = 2;

        path.replaceWith(declaration);
      },

      FunctionExpression(path) {
        const { node } = path;
        if (!node.generator) return;
        node.generator = false;

        const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__wrapGenerator'));
        const call = t.callExpression(helper, [t.cloneNode(node)]);

        path.replaceWith(call);
      },

      YieldExpression(path) {
        const { node } = path;
        const coroutineYield = t.memberExpression(t.identifier('coroutine'), t.identifier('yield'));
        path.replaceWith(t.callExpression(coroutineYield, [t.cloneNode(node.argument)]));
      },
    },
  };
}
