import callDelegate from '@babel/helper-call-delegate';
import { template, types as t } from '@babel/core';

const buildLooseDefaultParam = template(`
  if (ASSIGNMENT_IDENTIFIER === undefined) {
    ASSIGNMENT_IDENTIFIER = DEFAULT_VALUE;
  }
`);

const buildLooseDestructuredDefaultParam = template(`
  let ASSIGNMENT_IDENTIFIER = PARAMETER_NAME === undefined ? DEFAULT_VALUE : PARAMETER_NAME ;
`);

function isSafeBinding(scope, node) {
  if (!scope.hasOwnBinding(node.name)) return true;
  const { kind } = scope.getOwnBinding(node.name);
  return kind === 'param' || kind === 'local';
}

const iifeVisitor = {
  ReferencedIdentifier(path, state) {
    const { scope, node } = path;
    if (node.name === 'eval' || !isSafeBinding(scope, node)) {
      state.iife = true;
      path.stop();
    }
  },

  Scope(path) {
    // different bindings
    path.skip();
  },
};

export default function convertFunctionParams(path) {
  const { scope } = path;

  const state = {
    scope,
    iife: false,
  };

  const body = [];
  const params = path.get('params');

  for (let i = 0; i < params.length; i += 1) {
    const param = params[i];

    if (param.isAssignmentPattern()) {
      const left = param.get('left');
      const right = param.get('right');

      if (left.isIdentifier()) {
        body.push(
          buildLooseDefaultParam({
            ASSIGNMENT_IDENTIFIER: left.node,
            DEFAULT_VALUE: right.node,
          }),
        );
        param.replaceWith(left.node);
      } else if (left.isObjectPattern() || left.isArrayPattern()) {
        const paramName = scope.generateUidIdentifier();
        body.push(
          buildLooseDestructuredDefaultParam({
            ASSIGNMENT_IDENTIFIER: left.node,
            DEFAULT_VALUE: right.node,
            PARAMETER_NAME: paramName,
          }),
        );
        param.replaceWith(paramName);
      }
    } else if (param.isObjectPattern() || param.isArrayPattern()) {
      const uid = path.scope.generateUidIdentifier('ref');

      const defNode = t.variableDeclaration('let', [t.variableDeclarator(param.node, uid)]);
      body.push(defNode);

      param.replaceWith(uid);
    }

    if (!state.iife && !param.isIdentifier()) {
      param.traverse(iifeVisitor, state);
    }
  }

  if (body.length === 0) return false;

  // ensure it's a block, useful for arrow functions
  path.ensureBlock();

  if (state.iife) {
    body.push(callDelegate(path, scope));
    path.set('body', t.blockStatement(body));
  } else {
    path.get('body').unshiftContainer('body', body);
  }

  return true;
}
