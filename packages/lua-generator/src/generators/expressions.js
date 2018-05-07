import * as n from '../node';

function AssignmentExpression(node, parent) {
  const parens =
    this.inForStatementInitCounter && node.operator === 'in' && !n.needsParens(node, parent);
  if (parens) this.token('(');
  this.print(node.left, node);
  this.space();

  if (/[A-z]+/.test(node.operator)) {
    this.word(node.operator);
  } else {
    this.token(node.operator);
  }

  this.space();
  this.print(node.right, node);
  if (parens) this.token(')');
}

export { AssignmentExpression as BinaryExpression, AssignmentExpression as LogicalExpression };

export function UnaryExpression(node) {
  if (node.operator === 'not') {
    this.word(node.operator);
    this.space();
  } else {
    this.token(node.operator);
  }
  this.print(node.argument, node);
}

export function MemberExpression(node) {
  this.print(node.base, node);
  this.token(node.indexer);
  this.print(node.identifier, node);
}

export function IndexExpression(node) {
  this.print(node.base, node);
  this.token('[');
  this.print(node.index, node);
  this.token(']');
}

export function CallExpression(node) {
  this.print(node.base, node);

  this.token('(');
  this.printList(node.arguments, node);
  this.token(')');
}

export function TableCallExpression(node) {
  this.print(node.base, node);
  this.space();
  this.print(node.arguments, node);
}

export function StringCallExpression(node) {
  this.print(node.base, node);
  this.space();
  this.print(node.argument, node);
}
