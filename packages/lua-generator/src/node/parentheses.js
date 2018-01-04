/* @flow */

import * as t from 'lua-types';

// https://www.lua.org/manual/5.3/manual.html#3.4.8
const PRECEDENCE = {
  or: 0,
  and: 1,
  '<': 2,
  '>': 2,
  '<=': 2,
  '>=': 2,
  '~=': 2,
  '==': 2,
  '|': 3,
  '~': 4,
  '&': 5,
  '<<': 6,
  '>>': 6,
  '..': 7,
  '+': 8,
  '-': 8,
  '*': 9,
  '/': 9,
  '//': 9,
  '%': 9,
  Unot: 10,
  'U#': 10,
  'U-': 10,
  'U~': 10,
  '^': 11,
};

function Binary(node: Object, parent: Object): boolean {
  if (t.isCallExpression(parent) || (t.isIndexExpression(parent) && parent.identifier === node)) {
    return false;
  }
  if (t.isUnaryExpression(parent)) return true;

  if (t.isBinary(parent)) {
    const parentOp = parent.operator;
    // Unary was tested above
    const parentPos = PRECEDENCE[parentOp];

    let nodeOp = node.operator;
    // Prepend 'U' to differ unary operators
    if (t.isUnaryExpression(node)) nodeOp = `U${nodeOp}`;
    const nodePos = PRECEDENCE[nodeOp];

    if (
      (parentPos === nodePos &&
        // babylon parses x + y + z as x + (y + z)
        // luarparse parses x + y + z as x + (y + z), yet x .. y .. z as (x .. y) .. z
        parent[parent.operator === '..' ? 'left' : 'right'] === node &&
        // Logical expressions with the same precedence don't need parens.
        !t.isLogicalExpression(parent)) ||
      parentPos > nodePos
    ) {
      return true;
    }
  }

  return false;
}

export { Binary as LogicalExpression, Binary as BinaryExpression, Binary as UnaryExpression };

function isFirstInStatement(printStack: Array<Object>): boolean {
  let i = printStack.length - 1;
  let node = printStack[i];
  i -= 1;
  let parent = printStack[i];
  while (i > 0) {
    if (t.isCallStatement(parent) && parent.expression === node) {
      return true;
    }

    if (
      (t.isCallExpression(parent) && parent.base === node) ||
      (t.isMemberExpression(parent) && parent.base === node) ||
      (t.isConditional(parent) && parent.test === node) ||
      (t.isBinary(parent) && parent.left === node)
      // (t.isAssignmentStatement(parent) && parent.left === node)
    ) {
      node = parent;
      i -= 1;
      parent = printStack[i];
    } else {
      return false;
    }
  }

  return false;
}

export function FunctionDeclaration(node: Object, parent: Object, printStack: Array<Object>) {
  return isFirstInStatement(printStack);
}
