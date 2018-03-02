/* @flow */

import * as t from 'lua-types';

export function File(node: Object) {
  return this.transform(node.program);
}

export function Program(node: Object) {
  return t.chunk(this.transformList(node.body));
}

export function BlockStatement(node: Object) {
  return t.doStatement(this.transformList(node.body));
}

export function Noop() {}

export { StringLiteral as DirectiveLiteral } from './types';
