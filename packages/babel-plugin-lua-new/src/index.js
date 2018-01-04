import { types as t } from '@babel/core';

export default function() {
  return {
    visitor: {
      NewExpression(path) {
        const { node } = path;
        const helper = this.addHelper('new');

        node.arguments.unshift(node.callee);
        path.replaceWith(t.callExpression(helper, node.arguments));
      },
    },
  };
}
