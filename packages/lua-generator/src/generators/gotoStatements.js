/* @flow */

export function GotoStatement(node: Object) {
  this.word('goto');
  this.space();
  this.print(node.label, node);
}

export function LabelStatement(node: Object) {
  this.token('::');
  this.print(node.label, node);
  this.token('::');
}
