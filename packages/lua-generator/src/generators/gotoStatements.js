export function GotoStatement(node) {
  this.word('goto');
  this.space();
  this.print(node.label, node);
}

export function LabelStatement(node) {
  this.token('::');
  this.print(node.label, node);
  this.token('::');
}
