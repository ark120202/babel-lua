import { types as t } from '@babel/core';

const binaryOperators = new Map();
binaryOperators.set('&', 'band');
binaryOperators.set('|', 'bor');
binaryOperators.set('^', 'bxor');
binaryOperators.set('<<', 'lshift');
binaryOperators.set('>>', 'arshift');
binaryOperators.set('>>>', 'rshift');

const NO_CONTEXT = Symbol.for('no context');

export default function(api, { target = '5.3' }) {
  if (target !== 'jit' && target !== '5.2' && target !== '5.3') {
    throw new Error(`"${target}" is not supported target`);
  }

  const scope = target === '5.2' ? 'bit32' : 'bit';
  const makeExpression = property => {
    const expression = t.memberExpression(t.identifier(scope), t.identifier(property));
    expression[NO_CONTEXT] = true;
    return expression;
  };

  return {
    visitor: {
      BinaryExpression(path) {
        const { node } = path;
        if (!binaryOperators.has(node.operator)) return;

        let expression;
        if (target === '5.3') {
          switch (node.operator) {
            case '>>':
              expression = t.memberExpression(t.identifier('Reflect'), t.identifier('__arshift'));
              break;
            case '>>>':
              node.operator = '>>';
              return;
            default:
              return;
          }
        } else {
          expression = makeExpression(binaryOperators.get(node.operator));
        }

        path.replaceWith(t.callExpression(expression, [node.left, node.right]));
      },

      UnaryExpression(path) {
        const { node } = path;
        if (node.operator !== '~' || target === '5.3') return;
        path.replaceWith(t.callExpression(makeExpression('bnot'), [node.argument]));
      },
    },
  };
}
