export function Identifier(node) {
  this.word(node.name);
}

export function TableKey(node) {
  this.token('[');
  this.print(node.key, node);
  this.token(']');
  this.space();
  this.token('=');
  this.space();
  this.print(node.value, node);
}

export function TableKeyString(node) {
  this.print(node.key, node);
  this.space();
  this.token('=');
  this.space();
  this.print(node.value, node);
}

export function TableValue(node) {
  this.print(node.value);
}

export function TableConstructorExpression(node) {
  const { fields } = node;
  this.token('{');
  if (fields.length > 0) {
    this.space();
    this.printList(fields, node, { indent: true, statement: true });
    this.space();
  }
  this.token('}');
}

export function BooleanLiteral(node) {
  this.word(node.value ? 'true' : 'false');
}

export function NilLiteral() {
  this.word('nil');
}

export function NumericLiteral(node) {
  const raw = this.getPossibleRaw(node);
  const value = String(node.value);
  if (raw == null) {
    this.number(value);
  } else if (this.format.minified) {
    this.number(raw.length < value.length ? raw : value);
  } else {
    this.number(raw);
  }
}

export function StringLiteral(node) {
  const raw = this.getPossibleRaw(node);
  if (!this.format.minified && raw != null) {
    this.token(raw);
    return;
  }

  // TODO: Expose it as luaesc module
  let val = node.value
    .replace(/\\/g, '\\\\')
    .replace(/\v/g, '\\v')
    .replace(/\t/g, '\\t')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\f/g, '\\f');

  if (this.format.quotes === 'double') {
    val = `"${val.replace(/"/g, '\\"')}"`;
  } else {
    val = `'${val.replace(/'/g, "\\'")}'`;
  }

  this.token(val);
}

// TODO: Make sure that `...` is the only possible value
export function VarargLiteral() {
  this.word('...');
}

export function Comment() {
  throw new Error('Comment is invalid node type');
}
