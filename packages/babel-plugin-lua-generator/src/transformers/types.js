import * as t from 'lua-types';

export function Identifier(node) {
  if (node.name === 'undefined') return t.nilLiteral();
  return t.identifier(node.name);
}

export function ThisExpression() {
  return t.identifier('this');
}

export function StringLiteral(node) {
  return t.stringLiteral(node.value);
}

export function NumericLiteral(node) {
  return t.numericLiteral(node.value);
}

export function BooleanLiteral(node) {
  return t.booleanLiteral(node.value);
}

export function NullLiteral() {
  return t.nilLiteral();
}

export function RestElement() {
  return t.varargLiteral();
}

export function SpreadElement(node) {
  return t.callExpression(t.memberExpression(t.identifier('table'), '.', t.identifier('unpack')), [
    node.argument,
  ]);
}
