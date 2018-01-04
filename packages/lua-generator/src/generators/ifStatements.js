/* @flow */

export function IfStatement(node: Object) {
  this.printSequence(node.clauses, node);
  this.endBlock();
}

export function IfClause(node: Object) {
  this.word('if');
  this.space();
  this.print(node.condition, node);
  this.space();
  this.word('then');
  this.printBlock(node);
  this.removeTrailingNewline();
  if (this.format.minified) this._buf.removeLastSemicolon();
}

export function ElseifClause(node: Object) {
  this.word('elseif');
  this.space();
  this.print(node.condition, node);
  this.space();
  this.word('then');
  this.printBlock(node);
  this.removeTrailingNewline();
  if (this.format.minified) this._buf.removeLastSemicolon();
}

export function ElseClause(node: Object) {
  this.word('else');
  this.printBlock(node);
  this.removeTrailingNewline();
  if (this.format.minified) this._buf.removeLastSemicolon();
}
