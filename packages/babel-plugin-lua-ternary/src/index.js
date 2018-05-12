import { types as t } from '@babel/core';

function wrapValue(expression) {
  return t.isCallExpression(expression) ? t.arrowFunctionExpression([], expression) : expression;
}

export default function() {
  return {
    visitor: {
      ConditionalExpression(path) {
        const { node } = path;

        const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__iif'));
        const call = t.callExpression(helper, [
          node.test,
          wrapValue(node.consequent),
          wrapValue(node.alternate),
        ]);

        path.replaceWith(call);
      },
    },
  };
}
