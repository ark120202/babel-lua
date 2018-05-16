import { types as bt } from '@babel/core';
import * as t from 'lua-types';

const operatorMap = new Map();
operatorMap.set('===', '==');
operatorMap.set('!=', '~=');
operatorMap.set('!==', '~=');

export function BinaryExpression(node) {
  const operator = operatorMap.has(node.operator) ? operatorMap.get(node.operator) : node.operator;
  return t.binaryExpression(operator, this.transform(node.left), this.transform(node.right));
}

export function LogicalExpression(node) {
  if (node.operator !== '&&' && node.operator !== '||') {
    // FIXME: Use path.buildCodeFrameError
    throw new Error(`${node.operator} is unsupported logical operator`);
  }
  const operator = node.operator === '&&' ? 'and' : 'or';
  return t.binaryExpression(operator, this.transform(node.left), this.transform(node.right));
}

export function AssignmentExpression(node, parent) {
  if (!bt.isExpressionStatement(parent)) {
    // FIXME: Use path.buildCodeFrameError
    throw new Error("AssignmentExpression's not in ExpressionStatement's are not supported.");
  }
  if (node.operator !== '=') {
    // FIXME: Use path.buildCodeFrameError
    throw new Error(`${node.operator} is unsupported assignment expression operator`);
  }

  return t.assignmentStatement([this.transform(node.left)], [this.transform(node.right)]);
}

export function UpdateExpression(node, parent) {
  if (!bt.isExpressionStatement(parent)) {
    // FIXME: Use path.buildCodeFrameError
    throw new Error("UpdateExpression's not in ExpressionStatement's are not supported.");
  }
  if (node.operator !== '++' && node.operator !== '--') {
    // FIXME: Use path.buildCodeFrameError
    throw new Error(`Invalid UpdateExpression operator ${node.operator}`);
  }

  const right = t.binaryExpression(
    node.operator === '++' ? '+' : '-',
    this.transform(node.argument),
    t.numericLiteral(1),
  );
  return t.assignmentStatement([this.transform(node.argument)], [right]);
}

export function UnaryExpression(node) {
  switch (node.operator) {
    case 'void':
      return t.binaryExpression('and', this.transform(node.argument), t.nilLiteral());
    case 'delete':
      return t.assignmentStatement([this.transform(node.argument)], [t.nilLiteral()]);
    case '!':
      return t.unaryExpression('not', this.transform(node.argument));
    case '+':
      return t.callExpression(t.identifier('tonumber'), [this.transform(node.argument)]);
    case '-':
    case '~':
      return t.unaryExpression(node.operator, this.transform(node.argument));
    default:
      // FIXME: Use path.buildCodeFrameError
      throw new Error(`${node.operator} is unsupported unary operator`);
  }
}

export function CallExpression(node) {
  if (bt.isIdentifier(node.callee, { name: '__lua' }) && node.arguments.length === 1) {
    const argument = node.arguments[0];
    // TODO: Use path.evaluate, ref: https://github.com/babel/babel/blob/6.x/packages/babel-plugin-transform-eval/src/index.js
    if (bt.isStringLiteral(argument)) {
      return t.luaRaw(argument.value);
    }
  }

  return t.callExpression(this.transform(node.callee), this.transformList(node.arguments));
}

const NO_CONTEXT = Symbol.for('no context');
export function MemberExpression(node, parent) {
  if (node.computed) {
    return t.indexExpression(this.transform(node.object), this.transform(node.property));
  }

  // Always pass context in calls, since most of Lua apis expect it
  const indexer =
    bt.isCallExpression(parent) && parent.callee === node && !node[NO_CONTEXT] ? ':' : '.';
  return t.memberExpression(this.transform(node.object), indexer, this.transform(node.property));
}

export function ObjectExpression(node) {
  return t.tableConstructorExpression(this.transformList(node.properties));
}

export function ObjectProperty(node) {
  const constructor = node.computed || bt.isLiteral(node.key) ? t.tableKey : t.tableKeyString;
  return constructor(this.transform(node.key), this.transform(node.value));
}

export function ArrayExpression(node) {
  return t.tableConstructorExpression(this.transformList(node.elements).map(n => t.tableValue(n)));
}

export function SequenceExpression(node) {
  return t.indexExpression(
    t.tableConstructorExpression(this.transformList(node.expressions).map(n => t.tableValue(n))),
    t.numericLiteral(node.expressions.length),
  );
}
