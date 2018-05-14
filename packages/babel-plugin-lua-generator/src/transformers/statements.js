import { types as bt } from '@babel/core';
import * as t from 'lua-types';

export function ExpressionStatement(node) {
  if (bt.isCallExpression(node.expression)) return t.callStatement(this.transform(node.expression));
  // In most cases these are not identical, but it should be handled inside expressions
  return this.transform(node.expression);
}

function getIfClauses(node, isInIfClause = false) {
  const clauses = [];
  const ifClause = isInIfClause ? t.elseifClause : t.ifClause;
  clauses.push(ifClause(this.transform(node.test), this.transformBlock(node.consequent)));

  const { alternate } = node;
  if (alternate) {
    if (bt.isIfStatement(alternate)) {
      clauses.push(...getIfClauses.call(this, alternate, true));
    } else {
      clauses.push(t.elseClause(this.transformBlock(alternate)));
    }
  }

  return clauses;
}

export function IfStatement(node) {
  return t.ifStatement(getIfClauses.call(this, node));
}

export function ReturnStatement(node) {
  return t.returnStatement([this.transform(node.argument)]);
}

export function WhileStatement(node) {
  return t.whileStatement(this.transform(node.test), this.transformBlock(node.body));
}

export function DoWhileStatement(node) {
  return t.repeatStatement(
    this.transform(bt.unaryExpression('!', node.test)),
    this.transformBlock(node.body),
  );
}

export function ThrowStatement(node) {
  return t.callStatement(t.callExpression(t.identifier('error'), [this.transform(node.argument)]));
}

export function VariableDeclaration(node) {
  // In JS let and const scoping are like local in Lua, but there is no alternative for var.
  // TODO: Make a plugin to fix scope or prohibit var use at all.
  return this.transformList(node.declarations);
}

export function VariableDeclarator(node) {
  return t.localStatement([this.transform(node.id)], [this.transform(node.init)]);
}

function extractNumericFor(node) {
  if (!node.init || !node.test || !node.update) return null;
  let variable;
  let start;
  let end;
  let step;

  if (bt.isVariableDeclaration(node.init) && node.init.declarations.length === 1) {
    const initDeclaration = node.init.declarations[0];
    variable = initDeclaration.id;
    start = initDeclaration.init;
  }
  if (variable === undefined || start === undefined) return null;

  // TODO: Handle more cases
  if (bt.isUpdateExpression(node.update)) {
    if (node.update.argument.name === variable.name) {
      if (node.update.operator !== '++' && node.update.operator !== '--') {
        throw new Error(`Invalid UpdateExpression operator ${node.update.operator}`);
      }

      step = node.update.operator === '++' ? null : bt.unaryExpression('-', bt.numericLiteral(1));
    }
  } /* else if (bt.isAssignmentExpression(node.update)) {
    if (node.update.operator === '+=' || node.update.operator === '-=') {
      if (node.update.argument.name === variable.name) {
        step = 1;
      }
    }
  } */
  if (step === undefined) return null;

  if (
    bt.isBinaryExpression(node.test) &&
    (node.test.operator === '>=' || node.test.operator === '<=')
  ) {
    const isStepForward = step === null || bt.isNumericLiteral(step);
    const forwardOp = isStepForward ? '>=' : '<=';
    const backwardOp = isStepForward ? '<=' : '>=';

    // TODO: More logic
    if (
      bt.isIdentifier(node.test.left) &&
      node.test.left.name === variable.name &&
      node.test.operator === backwardOp
    ) {
      end = node.test.right;
    } else if (
      bt.isIdentifier(node.test.right) &&
      node.test.right.name === variable.name &&
      node.test.operator === forwardOp
    ) {
      end = node.test.left;
    }
  }
  if (end === undefined) return null;

  return {
    variable,
    start,
    end,
    step,
  };
}

export function ForStatement(node) {
  // Simplify typical `for (var i = 0; i < 10; i++)` case
  const numericResult = extractNumericFor(node);
  if (numericResult) {
    return t.forNumericStatement(
      this.transform(numericResult.variable),
      this.transform(numericResult.start),
      this.transform(numericResult.end),
      this.transform(numericResult.step),
      this.transformBlock(node.body),
    );
  }

  // Use `while` for more complicated cases
  const body = this.transformBlock(node.body);
  if (node.update) body.push(this.transform(bt.expressionStatement(node.update)));
  return [
    ...(node.init ? this.transform(node.init) : []),
    t.whileStatement(node.test ? this.transform(node.test) : t.booleanLiteral(true), body),
  ];
}

export function ForInStatement(node) {
  const variable = bt.isVariableDeclaration(node.left)
    ? this.transform(node.left.declarations[0].id)
    : this.transform(node.left);

  return t.forGenericStatement(
    [variable],
    [t.callExpression(t.identifier('pairs'), [this.transform(node.right)])],
    this.transformBlock(node.body),
  );
}

const FOR_OF_UID = Symbol.for('for..of uid');
export function ForOfStatement(node) {
  const variable = bt.isVariableDeclaration(node.left)
    ? this.transform(node.left.declarations[0].id)
    : this.transform(node.left);
  const helper = t.memberExpression(t.identifier('Reflect'), ':', t.identifier('__forOf'));

  let uid = node[FOR_OF_UID];
  // TODO: Apply visitor before transform in testing
  if (uid == null && process.env.NODE_ENV === 'test') uid = bt.identifier('_');
  if (uid == null) throw new Error('UID not found for ForOfStatement transform');

  return t.forGenericStatement(
    [this.transform(uid), variable],
    [t.callExpression(helper, [this.transform(node.right)])],
    this.transformBlock(node.body),
  );
}
