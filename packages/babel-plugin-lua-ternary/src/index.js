import { types as t } from '@babel/core';

export default function() {
  return {
    visitor: {
      ConditionalExpression(path) {
        const { node } = path;

        const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__iif'));
        const call = t.callExpression(helper, [
          node.test,
          t.arrowFunctionExpression([], node.consequent),
          t.arrowFunctionExpression([], node.alternate),
        ]);

        path.replaceWith(call);
      },
    },
  };
}
