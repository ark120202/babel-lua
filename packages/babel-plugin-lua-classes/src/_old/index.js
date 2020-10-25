// import annotateAsPure from '@babel/helper-annotate-as-pure';
// import nameFunction from '@babel/helper-function-name';
// import splitExportDeclaration from '@babel/helper-split-export-declaration';
import { types as t } from '@babel/core';
import ClassTransformer from './transformer';

export default function() {
  // todo: investigate traversal requeueing
  const VISITED = Symbol('visited');

  return {
    visitor: {
      /* ExportDefaultDeclaration(path) {
        if (!path.get('declaration').isClassDeclaration()) return;
        splitExportDeclaration(path);
      }, */

      ClassDeclaration(path) {
        const { node } = path;

        const ref = node.id || path.scope.generateUidIdentifier('class');

        path.replaceWith(
          t.variableDeclaration('let', [t.variableDeclarator(ref, t.toExpression(node))]),
        );
      },

      ClassExpression(path, state) {
        const { node } = path;
        if (node[VISITED]) return;

        /* const inferred = nameFunction(path);
        if (inferred && inferred !== node) {
          path.replaceWith(inferred);
          return;
        } */

        node[VISITED] = true;

        path.replaceWith(new ClassTransformer(path, state.file).run());

        /* if (path.isCallExpression()) {
          annotateAsPure(path);
          if (path.get('callee').isArrowFunctionExpression()) {
            path.get('callee').arrowFunctionToExpression();
          }
        } */
      },

      NewExpression(path) {
        const { node } = path;
        const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__new'));

        node.arguments.unshift(node.callee);
        path.replaceWith(t.callExpression(helper, node.arguments));
      },

      BinaryExpression(path) {
        const { node } = path;
        if (node.operator !== 'instanceof') return;
        const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__instanceof'));

        path.replaceWith(t.callExpression(helper, [node.left, node.right]));
      },
    },
  };
}
