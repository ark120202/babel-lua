/* @flow */

import * as t from 'lua-types';

export function Identifier(node: Object) {
  if (node.name === 'undefined') return t.nilLiteral();
  return t.identifier(node.name);
}

export function StringLiteral(node: Object) {
  return t.stringLiteral(node.value);
}

export function NumericLiteral(node: Object) {
  return t.numericLiteral(node.value);
}

export function BooleanLiteral(node: Object) {
  return t.booleanLiteral(node.value);
}

export function NullLiteral() {
  return t.nilLiteral();
}

export function RestElement() {
  return t.varargLiteral();
}

export function SpreadElement(node: Object) {
  return t.callExpression(t.memberExpression(t.identifier('table'), '.', t.identifier('unpack')), [
    node.argument,
  ]);
}
