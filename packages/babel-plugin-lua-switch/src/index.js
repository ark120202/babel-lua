import { template, types as t } from '@babel/core';

const buildWrapper = template(`
do {
  const SWITCH_ID = SWITCH_VALUE;
  const CASES_ID = CASES_VALUE;

  CLAUSES;
} while (false);
`);

class Transformer {
  values = [];
  clauses = [];
  constructor(path) {
    this.node = path.node;
    this.scope = path.scope;
    this.path = path;
  }

  run() {
    this.valueId = this.scope.generateUidIdentifier('switchValue');
    this.casesId = this.scope.generateUidIdentifier('cases');
    this.generateBody();

    return buildWrapper({
      SWITCH_ID: this.valueId,
      SWITCH_VALUE: this.node.discriminant,
      CASES_ID: this.casesId,
      CASES_VALUE: t.arrayExpression(this.values),
      CLAUSES: this.clauses,
    });
  }

  addCases() {
    let falledCases = [];
    this.node.cases.forEach((c, i) => {
      falledCases.push(c);
      if (c.consequent.length === 0) return;
      if (/* hasUnconditionalBreakStatement */ true) falledCases = [];
      const values = c.test == null ? [] : this.node.cases.slice(0, i + 1).map(n => n.test);
      this.clauses.push(
        t.ifStatement(this._anyOfValues(values), this._mapClauseBody(c.consequent)),
      );
    });
  }

  _anyOfValues(values) {
    const notBreak = t.unaryExpression('!', t.cloneNode(this.breakId));
    if (values.length === 0) return notBreak;
    values = values.map(v => t.binaryExpression('==', this.valueId, v));

    if (values.length === 1) return t.logicalExpression('&&', notBreak, values[0]);

    const valuesNode = values
      .slice(1)
      .reduce((node, v) => t.logicalExpression('||', node, v), values[0]);

    return t.logicalExpression('&&', notBreak, valuesNode);
  }

  _mapClauseBody(body) {
    return t.blockStatement(body.map(b => this.traverse(b, {})));
  }
}

export default function() {
  return {
    visitor: {
      SwitchStatement(path) {
        path.replaceWithMultiple(new Transformer(path).run());
      },
    },
  };
}
