import { types as t } from '@babel/core';
import splitExportDeclaration from '@babel/helper-split-export-declaration';

const NO_MARK = Symbol('no mark');
const COMPUTED_WRAPPED = Symbol('computed wrapped');

export default function() {
  return {
    visitor: {
      CallExpression(path) {
        const calleePath = path.get('callee');

        if (calleePath.isIdentifier()) {
          // Don't wrap helpers, require, marcos's and functions without arguments
          if (
            !calleePath.node[Symbol.for('helper')] &&
            calleePath.node.name !== 'require' &&
            calleePath.node.name !== '__lua' &&
            calleePath.node.name !== '__export' &&
            path.node.arguments.length > 0
          ) {
            path.node.callee = t.memberExpression(calleePath.node, t.identifier('call'));
            path.node.arguments.unshift(t.nullLiteral());
          }

          return;
        }

        if (calleePath.isMemberExpression()) {
          const isComputed = calleePath.node.computed;
          if (!isComputed) return;

          if (path.node[COMPUTED_WRAPPED]) return;
          path.node[COMPUTED_WRAPPED] = true;

          // Wrap computed
          const { object, property } = calleePath.node;
          if (t.isIdentifier(object) || (t.isLiteral(object) && t.isImmutable(object))) {
            path.node.arguments.unshift(object);
          } else {
            const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__computed'));
            path.replaceWith(t.callExpression(helper, [object, property, ...path.node.arguments]));
          }
        }
      },

      ExportDefaultDeclaration(path) {
        if (!path.get('declaration').isFunctionDeclaration()) return;
        splitExportDeclaration(path);
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

      'FunctionExpression|ArrowFunctionExpression': function FunctionExpression(path) {
        if (path.node[NO_MARK]) return;
        if (
          path.parentPath.isCallExpression() &&
          path.parentPath.get('callee').isIdentifier({ name: '__export' })
        ) {
          path.node[NO_MARK] = true;
          path.parentPath.replaceWith(path.node);
          return;
        }

        const { node } = path;
        const isArrow = path.isArrowFunctionExpression();

        if (isArrow) {
          path.ensureBlock();
          node.type = 'FunctionExpression';
        }

        const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__markFunction'));

        if (!isArrow && path.parentPath.isCallExpression({ id: helper.id })) {
          return;
        }

        if (isArrow) {
          if (node.params.length > 0) node.params.unshift(path.scope.generateUidIdentifier('_'));
        } else {
          // TODO: Traverse body and insert it only when used
          node.params.unshift(t.thisExpression());
        }

        const call = t.callExpression(helper, [t.cloneNode(node)]);
        path.replaceWith(call);
      },
    },
  };
}
