import { types as bt } from '@babel/core';
import * as t from 'lua-types';

function functionFactory(isExp) {
  return function FunctionHandler(node) {
    const body = this.transformBlock(node.body);
    const restParam = node.params.find(param => bt.isRestElement(param));
    if (restParam) {
      body.unshift(
        t.localStatement(
          [restParam.argument],
          [t.tableConstructorExpression([t.tableValue(t.varargLiteral())])],
        ),
      );
    }

    return t.functionStatement(
      isExp ? null : this.transform(node.id),
      this.transformList(node.params),
      // Simulate module structure for declaration
      !isExp,
      body,
    );
  };
}

export const FunctionDeclaration = functionFactory(false);
export const FunctionExpression = functionFactory(true);
