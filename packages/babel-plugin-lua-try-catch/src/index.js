import { template, types as t } from '@babel/core';
import syntaxOptionalCatchBinding from '@babel/plugin-syntax-optional-catch-binding';

const buildReturnValueCheck = template(`
const RETURNS = CALL;
if (RETURNS === Reflect.TryNil) {
  return RETURNS;
} else if (RETURNS != null) {
  return RETURNS;
}
`);

function traverseReturnStatement(path) {
  let has = false;

  path.traverse({
    FunctionParent(p) {
      p.skip();
    },
    ReturnStatement(p) {
      has = true;

      const argument = p.get('argument');
      if (
        argument.node == null ||
        argument.isNullLiteral() ||
        argument.isIdentifier({ name: 'undefined' })
      ) {
        argument.replaceWith(t.memberExpression(t.identifier('Reflect'), t.identifier('TryNil')));
      }
    },
  });

  return has;
}

export default () => ({
  inherits: syntaxOptionalCatchBinding,

  visitor: {
    TryStatement(path) {
      const clauses = [];

      const block = path.get('block');
      const handler = path.get('handler');
      const finalizer = path.get('finalizer');

      const tryFunction = t.arrowFunctionExpression([], block.node);
      clauses.push(tryFunction);

      if (handler.node != null) {
        const handlerFunction = t.arrowFunctionExpression(
          handler.node.param != null ? [handler.node.param] : [],
          handler.node.body,
        );
        clauses.push(handlerFunction);
      } else if (finalizer.node != null) {
        clauses.push(t.nullLiteral());
      }

      if (finalizer.node != null) {
        const finalizerFunction = t.arrowFunctionExpression([], finalizer.node);
        clauses.push(finalizerFunction);
      }

      const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__try'));
      const expression = t.callExpression(helper, clauses);
      if (traverseReturnStatement(path)) {
        const returns = path.scope.generateUidIdentifier('returns');
        path.replaceWithMultiple(buildReturnValueCheck({ RETURNS: returns, CALL: expression }));
      } else {
        path.replaceWith(t.expressionStatement(expression));
      }
    },
  },
});
