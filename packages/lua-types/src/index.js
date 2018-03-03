/* @flow */

// TODO: Make it similar to babel-types
import luaparse, { type LuaNode } from 'luaparse';

export type { LuaNode } from 'luaparse';

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

export const isLabelStatement = (node: LuaNode) => node.type === 'LabelStatement';
export const isBreakStatement = (node: LuaNode) => node.type === 'BreakStatement';
export const isGotoStatement = (node: LuaNode) => node.type === 'GotoStatement';
export const isReturnStatement = (node: LuaNode) => node.type === 'ReturnStatement';
export const isIfStatement = (node: LuaNode) => node.type === 'IfStatement';
export const isIfClause = (node: LuaNode) => node.type === 'IfClause';
export const isElseifClause = (node: LuaNode) => node.type === 'ElseifClause';
export const isElseClause = (node: LuaNode) => node.type === 'ElseClause';
export const isWhileStatement = (node: LuaNode) => node.type === 'WhileStatement';
export const isDoStatement = (node: LuaNode) => node.type === 'DoStatement';
export const isRepeatStatement = (node: LuaNode) => node.type === 'RepeatStatement';
export const isLocalStatement = (node: LuaNode) => node.type === 'LocalStatement';
export const isAssignmentStatement = (node: LuaNode) => node.type === 'AssignmentStatement';
export const isCallStatement = (node: LuaNode) => node.type === 'CallStatement';
export const isFunctionDeclaration = (node: LuaNode) => node.type === 'FunctionDeclaration';
export const isForNumericStatement = (node: LuaNode) => node.type === 'ForNumericStatement';
export const isForGenericStatement = (node: LuaNode) => node.type === 'ForGenericStatement';
export const isChunk = (node: LuaNode) => node.type === 'Chunk';
export const isIdentifier = (node: LuaNode) => node.type === 'Identifier';
export const isStringLiteral = (node: LuaNode) => node.type === 'StringLiteral';
export const isNumericLiteral = (node: LuaNode) => node.type === 'NumericLiteral';
export const isBooleanLiteral = (node: LuaNode) => node.type === 'BooleanLiteral';
export const isNilLiteral = (node: LuaNode) => node.type === 'NilLiteral';
export const isVarargLiteral = (node: LuaNode) => node.type === 'VarargLiteral';
export const isTableKey = (node: LuaNode) => node.type === 'TableKey';
export const isTableKeyString = (node: LuaNode) => node.type === 'TableKeyString';
export const isTableValue = (node: LuaNode) => node.type === 'TableValue';
export const isTableConstructorExpression = (node: LuaNode) =>
  node.type === 'TableConstructorExpression';
export const isLogicalExpression = (node: LuaNode) => node.type === 'LogicalExpression';
export const isBinaryExpression = (node: LuaNode) => node.type === 'BinaryExpression';
export const isUnaryExpression = (node: LuaNode) => node.type === 'UnaryExpression';
export const isMemberExpression = (node: LuaNode) => node.type === 'MemberExpression';
export const isIndexExpression = (node: LuaNode) => node.type === 'IndexExpression';
export const isCallExpression = (node: LuaNode) => node.type === 'CallExpression';
export const isTableCallExpression = (node: LuaNode) => node.type === 'TableCallExpression';
export const isStringCallExpression = (node: LuaNode) => node.type === 'StringCallExpression';
export const isComment = (node: LuaNode) => node.type === 'Comment';

export const isLuaRaw = (node: LuaNode) => node.type === 'LuaRaw';

export const isBinary = (node: LuaNode) => isLogicalExpression(node) || isBinaryExpression(node);
export const isConditional = (node: LuaNode) => isIfClause(node) || isElseifClause(node);

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

export function luaRaw(code: string): LuaNode {
  return { type: 'LuaRaw', code };
}

export const stringLiteral = (value: string, raw?: string) =>
  literal(tokenTypes.StringLiteral, value, raw);
export const numericLiteral = (value: number, raw?: string) =>
  literal(tokenTypes.NumericLiteral, value, raw);
export const booleanLiteral = (value: boolean, raw?: string) =>
  literal(tokenTypes.BooleanLiteral, value, raw);
export const nilLiteral = () => literal(tokenTypes.NilLiteral, null);
export const varargLiteral = () => literal(tokenTypes.VarargLiteral, '...');
