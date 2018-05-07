export function DoStatement(node) {
  this.word('do');
  this.printBlock(node);
  this.endBlock();
}

export function WhileStatement(node) {
  this.word('while');
  this.space();
  this.print(node.condition);
  this.space();
  this.word('do');
  this.printBlock(node);
  this.endBlock();
}

export function RepeatStatement(node) {
  this.word('repeat');
  this.printBlock(node);
  this.word('until');
  this.space();
  this.print(node.condition);
}

export function ForGenericStatement(node) {
  this.word('for');
  this.space();
  this.printList(node.variables, node);
  this.space();
  this.word('in');
  this.space();
  this.printList(node.iterators, node);
  this.space();
  this.word('do');
  this.printBlock(node);
  this.endBlock();
}

export function ForNumericStatement(node) {
  this.word('for');
  this.space();
  this.print(node.variable);
  this.space();
  this.token('=');
  this.space();
  const expressions = [node.start, node.end];
  if (node.step != null) expressions.push(node.step);
  this.printList(expressions, node);
  this.space();
  this.word('do');
  this.printBlock(node);
  this.endBlock();
}
