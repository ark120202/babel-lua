import { types as t } from '@babel/core';

export default function() {
  return {
    visitor: {
      Scope({ scope }) {
        if (!scope.getBinding('Symbol')) {
          return;
        }

        scope.rename('Symbol');
      },

      UnaryExpression(path) {
        const { node, parent } = path;
        if (node.operator !== 'typeof') return;

        if (
          path.parentPath.isBinaryExpression() &&
          t.EQUALITY_BINARY_OPERATORS.indexOf(parent.operator) >= 0
        ) {
          // optimise `typeof foo === "string"` since we can determine that they'll never
          // need to handle symbols
          const opposite = path.getOpposite();
          if (
            opposite.isLiteral() &&
            opposite.node.value !== 'symbol' &&
            opposite.node.value !== 'object'
          ) {
            path.replaceWith(t.callExpression(t.identifier('type'), [node.argument]));
          }
        }

        const helper = this.addHelper('typeof');
        const call = t.callExpression(helper, [node.argument]);
        const arg = path.get('argument');

        if (arg.isIdentifier() && !path.scope.hasBinding(arg.node.name)) {
          const undefLiteral = t.stringLiteral('undefined');
          const unary = t.unaryExpression('typeof', node.argument);
          path.replaceWith(
            t.conditionalExpression(
              t.binaryExpression('===', unary, undefLiteral),
              undefLiteral,
              call,
            ),
          );
        } else {
          path.replaceWith(call);
        }
      },
    },
  };
}
