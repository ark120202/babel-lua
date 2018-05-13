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

function Binary(node, parent) {
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

export function FunctionDeclaration(node, parent) {
  return t.isCallExpression(parent) && parent.base === node;
}

function Literal(node, parent) {
  return (t.isIndexExpression(parent) || t.isMemberExpression(parent)) && parent.base === node;
}

export {
  Literal as StringLiteral,
  Literal as NumericLiteral,
  Literal as BooleanLiteral,
  Literal as TableConstructorExpression,
};
