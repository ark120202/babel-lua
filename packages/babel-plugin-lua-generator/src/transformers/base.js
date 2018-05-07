import * as t from 'lua-types';

export function File(node) {
  return this.transform(node.program);
}

export function Program(node) {
  return t.chunk(this.transformList(node.body));
}

export function BlockStatement(node) {
  return t.doStatement(this.transformList(node.body));
}

export function Noop() {}

export { StringLiteral as DirectiveLiteral } from './types';
