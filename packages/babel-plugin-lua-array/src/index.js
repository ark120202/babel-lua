import { types as t } from '@babel/core';

export default function() {
  return {
    visitor: {
      ArrayExpression(path) {
        path.replaceWith(t.newExpression(t.identifier('Array'), path.node.elements));
      },
    },
  };
}
