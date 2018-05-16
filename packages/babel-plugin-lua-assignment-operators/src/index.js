import { types as t } from '@babel/core';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Assignment_Operators#Overview
const operators = new Set(['+', '-', '*', '/', '%', '**', '<<', '>>', '>>>', '&', '^', '|']);

export default () => ({
  visitor: {
    AssignmentExpression(path) {
      const { node } = path;
      if (node.operator === '=' || !node.operator.endsWith('=')) return;
      const binaryOperator = node.operator.slice(0, -1);
      if (!operators.has(binaryOperator)) {
        throw path.buildCodeFrameError(`Operator ${node.operator} is not supported`);
      }

      const expression = t.binaryExpression(binaryOperator, node.left, node.right);
      path.replaceWith(t.assignmentExpression('=', node.left, expression));
    },
  },
});
