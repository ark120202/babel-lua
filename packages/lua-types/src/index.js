// TODO: Make it similar to babel-types
import luaparse from 'luaparse';

export const types = [
  'LabelStatement',
  'BreakStatement',
  'GotoStatement',
  'ReturnStatement',
  'IfStatement',
  'IfClause',
  'ElseifClause',
  'ElseClause',
  'WhileStatement',
  'DoStatement',
  'RepeatStatement',
  'LocalStatement',
  'AssignmentStatement',
  'CallStatement',
  'FunctionDeclaration',
  'ForNumericStatement',
  'ForGenericStatement',
  'Chunk',
  'Identifier',
  'StringLiteral',
  'NumericLiteral',
  'BooleanLiteral',
  'NilLiteral',
  'VarargLiteral',
  'TableKey',
  'TableKeyString',
  'TableValue',
  'TableConstructorExpression',
  'LogicalExpression',
  'BinaryExpression',
  'UnaryExpression',
  'MemberExpression',
  'IndexExpression',
  'CallExpression',
  'TableCallExpression',
  'StringCallExpression',
  'Comment',

  'LuaRaw',
];

export const isLabelStatement = node => node.type === 'LabelStatement';
export const isBreakStatement = node => node.type === 'BreakStatement';
export const isGotoStatement = node => node.type === 'GotoStatement';
export const isReturnStatement = node => node.type === 'ReturnStatement';
export const isIfStatement = node => node.type === 'IfStatement';
export const isIfClause = node => node.type === 'IfClause';
export const isElseifClause = node => node.type === 'ElseifClause';
export const isElseClause = node => node.type === 'ElseClause';
export const isWhileStatement = node => node.type === 'WhileStatement';
export const isDoStatement = node => node.type === 'DoStatement';
export const isRepeatStatement = node => node.type === 'RepeatStatement';
export const isLocalStatement = node => node.type === 'LocalStatement';
export const isAssignmentStatement = node => node.type === 'AssignmentStatement';
export const isCallStatement = node => node.type === 'CallStatement';
export const isFunctionDeclaration = node => node.type === 'FunctionDeclaration';
export const isForNumericStatement = node => node.type === 'ForNumericStatement';
export const isForGenericStatement = node => node.type === 'ForGenericStatement';
export const isChunk = node => node.type === 'Chunk';
export const isIdentifier = node => node.type === 'Identifier';
export const isStringLiteral = node => node.type === 'StringLiteral';
export const isNumericLiteral = node => node.type === 'NumericLiteral';
export const isBooleanLiteral = node => node.type === 'BooleanLiteral';
export const isNilLiteral = node => node.type === 'NilLiteral';
export const isVarargLiteral = node => node.type === 'VarargLiteral';
export const isTableKey = node => node.type === 'TableKey';
export const isTableKeyString = node => node.type === 'TableKeyString';
export const isTableValue = node => node.type === 'TableValue';
export const isTableConstructorExpression = node => node.type === 'TableConstructorExpression';
export const isLogicalExpression = node => node.type === 'LogicalExpression';
export const isBinaryExpression = node => node.type === 'BinaryExpression';
export const isUnaryExpression = node => node.type === 'UnaryExpression';
export const isMemberExpression = node => node.type === 'MemberExpression';
export const isIndexExpression = node => node.type === 'IndexExpression';
export const isCallExpression = node => node.type === 'CallExpression';
export const isTableCallExpression = node => node.type === 'TableCallExpression';
export const isStringCallExpression = node => node.type === 'StringCallExpression';
export const isComment = node => node.type === 'Comment';

export const isLuaRaw = node => node.type === 'LuaRaw';

export const isBinary = node => isLogicalExpression(node) || isBinaryExpression(node);
export const isConditional = node => isIfClause(node) || isElseifClause(node);

export const tokenTypes = {
  EOF: luaparse.tokenTypes.EOF,
  StringLiteral: luaparse.tokenTypes.StringLiteral,
  Keyword: luaparse.tokenTypes.Keyword,
  Identifier: luaparse.tokenTypes.Identifier,
  NumericLiteral: luaparse.tokenTypes.NumericLiteral,
  Punctuator: luaparse.tokenTypes.Punctuator,
  BooleanLiteral: luaparse.tokenTypes.BooleanLiteral,
  NilLiteral: luaparse.tokenTypes.NilLiteral,
  VarargLiteral: luaparse.tokenTypes.VarargLiteral,
};

export const {
  labelStatement,
  breakStatement,
  gotoStatement,
  returnStatement,
  ifStatement,
  ifClause,
  elseifClause,
  elseClause,
  whileStatement,
  doStatement,
  repeatStatement,
  localStatement,
  assignmentStatement,
  callStatement,
  functionStatement,
  forNumericStatement,
  forGenericStatement,
  chunk,
  identifier,
  literal,
  tableKey,
  tableKeyString,
  tableValue,
  tableConstructorExpression,
  binaryExpression,
  unaryExpression,
  memberExpression,
  indexExpression,
  callExpression,
  tableCallExpression,
  stringCallExpression,
  comment,
} = luaparse.ast;

export function luaRaw(code) {
  return { type: 'LuaRaw', code };
}

export const stringLiteral = (value, raw) => literal(tokenTypes.StringLiteral, value, raw);
export const numericLiteral = (value, raw) => literal(tokenTypes.NumericLiteral, value, raw);
export const booleanLiteral = (value, raw) => literal(tokenTypes.BooleanLiteral, value, raw);
export const nilLiteral = () => literal(tokenTypes.NilLiteral, null);
export const varargLiteral = () => literal(tokenTypes.VarargLiteral, '...');
