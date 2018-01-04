import { types as t } from '@babel/core';

function wrapValue(expression) {
  return t.isCallExpression(expression) ? t.arrowFunctionExpression([], expression) : expression;
}

export default function() {
  return {
    visitor: {
      ConditionalExpression(path) {
        const { node } = path;

        const helper = this.addHelper('iif');
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
