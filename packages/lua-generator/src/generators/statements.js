/* @flow */

export function LuaRaw(node: Object) {
  this._append(node.code);
}

export function Chunk(node: Object) {
  this.printSequence(node.body, node);
}

export function FunctionDeclaration(node: Object) {
  if (node.isLocal) {
    this.word('local');
    this.space();
  }
  this.word('function');
  if (node.identifier) {
    this.space();
    this.print(node.identifier, node);
  }
  this.token('(');
  this.printList(node.parameters, node);
  this.token(')');
  this.printBlock(node);
  this.endBlock();
}

export function LocalStatement(node: Object) {
  this.word('local');
  this.space();
  this.printList(node.variables, node);
  if (node.init.length > 0) {
    this.space();
    this.token('=');
    this.space();
    this.printList(node.init, node);
  }

  this.semicolon();
}

export function AssignmentStatement(node: Object) {
  this.printList(node.variables, node);
  if (node.init.length > 0) {
    this.space();
    this.token('=');
    this.space();
    this.printList(node.init, node);
  }
  this.semicolon();
}

export function BreakStatement() {
  this.word('break');
  this.semicolon();
}

export function ReturnStatement(node: Object) {
  this.word('return');
  this.space();
  this.printList(node.arguments, node);
  this.semicolon();
}

export function CallStatement(node: Object) {
  this.print(node.expression, node);
  this.semicolon();
}
