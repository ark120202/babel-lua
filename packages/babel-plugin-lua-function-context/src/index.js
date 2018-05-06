import { types as t } from '@babel/core';

const NO_WRAP = Symbol('no wrap');

export default function() {
  return {
    visitor: {
      CallExpression(path) {
        if (path.node[NO_WRAP]) return;

        const calleePath = path.get('callee');

        if (calleePath.isIdentifier()) {
          // Don't wrap helpers and require
          if (!calleePath.node[Symbol.for('helper')] && calleePath.node.name !== 'require') {
            path.node.callee = t.memberExpression(calleePath.node, t.identifier('call'));
            path.node.arguments.unshift(t.nullLiteral());
          }

          return;
        }

        if (calleePath.isMemberExpression()) {
          const isComputed = calleePath.node.computed;
          if (!isComputed) return;

          // Wrap computed
          const { object, property } = calleePath.node;
          if (t.isIdentifier(object)) {
            // Easy way
            path.node.arguments.unshift(object);
          } else {
            // Hard way
            const objectId = t.identifier('_');
            const body = [];
            // const _ = OBJECT;
            body.push(t.variableDeclaration('const', [t.variableDeclarator(objectId, object)]));
            // return _[PROPERTY](_, ...)
            const returnCall = t.callExpression(
              t.memberExpression(objectId, property, true),
              [objectId].concat(path.node.arguments),
            );
            returnCall[NO_WRAP] = true;
            body.push(t.returnStatement(returnCall));

            const func = t.functionExpression(null, [], t.blockStatement(body));
            const iife = t.callExpression(func, []);
            iife._compact = true;
            path.replaceWith(iife);
          }
        }
      },

      FunctionDeclaration(path) {
        const { node } = path;

        const declaration = t.variableDeclaration('const', [
          t.variableDeclarator(node.id, t.toExpression(node)),
        ]);
        node.id = null;

        // TODO: FunctionDeclaration in Lua has different scoping rules from JS, so hoisting it breaks helper
        // declaration._blockHoist = 2;

        path.replaceWith(declaration);
      },

      'FunctionExpression|ArrowFunctionExpression': function FunctionExpression(path, state) {
        const { node } = path;
        const isArrow = path.isArrowFunctionExpression();

        if (isArrow) {
          path.ensureBlock();
          node.type = 'FunctionExpression';
        }

        const helper = state.addHelper('markFunction');

        if (!isArrow && path.parentPath.isCallExpression({ id: helper.id })) {
          return;
        }

        const ctx = path.scope.generateUidIdentifier(isArrow ? '_' : 'this');
        node.params.unshift(ctx);
        if (!isArrow) path.scope.rename('this', ctx.name);

        const call = t.callExpression(helper, [t.cloneNode(node)]);
        path.replaceWith(call);
      },
    },
  };
}
