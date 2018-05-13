import { types as t } from '@babel/core';

export default function() {
  return {
    visitor: {
      UnaryExpression(path) {
        const { node, parent } = path;
        if (node.operator !== 'typeof') return;

        if (
          path.parentPath.isBinaryExpression() &&
          t.EQUALITY_BINARY_OPERATORS.includes(parent.operator)
        ) {
          // optimise `typeof foo === "string"`
          const opposite = path.getOpposite();
          if (
            opposite.isLiteral() &&
            opposite.node.value !== 'symbol' &&
            opposite.node.value !== 'object'
          ) {
            if (opposite.node.value === 'undefined') {
              path.parentPath.replaceWith(t.binaryExpression('==', node.argument, t.nullLiteral()));
            } else {
              path.replaceWith(t.callExpression(t.identifier('type'), [node.argument]));
            }
            return;
          }
        }

        const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__typeof'));
        path.replaceWith(t.callExpression(helper, [node.argument]));
      },
    },
  };
}
