/* @flow */

import { types as bt } from '@babel/core';
import * as t from 'lua-types';

export function BinaryExpression(node: Object) {
  return t.binaryExpression(
    node.operator === '===' ? '==' : node.operator,
    this.transform(node.left),
    this.transform(node.right),
  );
}

export function LogicalExpression(node: Object) {
  if (node.operator !== '&&' && node.operator !== '||') {
    // FIXME: Use path.buildCodeFrameError
    throw new Error(`${node.operator} is unsupported logical operator`);
  }
  const operator = node.operator === '&&' ? 'and' : 'or';
  return t.binaryExpression(operator, this.transform(node.left), this.transform(node.right));
}

export function AssignmentExpression(node: Object, parent: Object) {
  if (!bt.isExpressionStatement(parent)) {
    // FIXME: Use path.buildCodeFrameError
    throw new Error("AssignmentExpression's not in ExpressionStatement's are not supported.");
  }
  switch (node.operator) {
    case '=':
      return t.assignmentStatement([this.transform(node.left)], [this.transform(node.right)]);
    case '+=':
    case '-=':
      return t.assignmentStatement(
        [this.transform(node.left)],
        [
          t.binaryExpression(
            node.operator === '+=' ? '+' : '-',
            this.transform(node.left),
            this.transform(node.right),
          ),
        ],
      );
    default:
      // FIXME: Use path.buildCodeFrameError
      throw new Error(`${node.operator} is unsupported assignment expression operator`);
  }
}

export function UpdateExpression(node: Object, parent: Object) {
  if (!bt.isExpressionStatement(parent)) {
    // FIXME: Use path.buildCodeFrameError
    throw new Error("AssignmentExpression's not in ExpressionStatement's are not supported.");
  }
  if (node.operator !== '++' && node.operator !== '--') {
    // FIXME: Use path.buildCodeFrameError
    throw new Error(`Invalid UpdateExpression operator ${node.operator}`);
  }
  return this.transform(
    bt.assignmentExpression(
      node.operator === '++' ? '+=' : '-=',
      node.argument,
      bt.numericLiteral(1),
    ),
    parent,
  );
}

export function UnaryExpression(node: Object) {
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

export function CallExpression(node: Object) {
  return t.callExpression(this.transform(node.callee), this.transformList(node.arguments));
}

export function MemberExpression(node: Object) {
  return node.computed
    ? t.indexExpression(this.transform(node.object), this.transform(node.property))
    : t.memberExpression(this.transform(node.object), '.', this.transform(node.property));
}

export function ObjectExpression(node: Object) {
  return t.tableConstructorExpression(this.transformList(node.properties));
}

export function ObjectProperty(node: Object) {
  const constructor = node.computed || bt.isLiteral(node.key) ? t.tableKey : t.tableKeyString;
  return constructor(this.transform(node.key), this.transform(node.value));
}

export function ArrayExpression(node: Object) {
  return t.tableConstructorExpression(this.transformList(node.elements).map(n => t.tableValue(n)));
}
