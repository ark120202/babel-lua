declare module 'luaparse' {
  export interface SourceLocation {
    start: {
      line: number;
      column: number;
    };

    end: {
      line: number;
      column: number;
    };
  }

  export interface LuaNode {
    type: string;
    range?: [number, number];
    loc?: SourceLocation;
    isLocal?: boolean;
    [key: string]: any;
  }

  export interface LuaparseOptions {
    wait?: boolean;
    comments?: boolean;
    scope?: boolean;
    locations?: boolean;
    ranges?: boolean;
    onCreateNode?: (node: LuaNode) => void;
    onCreateScope?: () => void;
    onDestroyScope?: () => void;
    onLocalDeclaration?: (identifier: LuaNode) => void;
    luaVersion?: '5.1' | '5.2' | '5.3';
    extendedIdentifiers?: boolean;
  }

  export const tokenTypes: {
    EOF: number;
    StringLiteral: number;
    Keyword: number;
    Identifier: number;
    NumericLiteral: number;
    Punctuator: number;
    BooleanLiteral: number;
    NilLiteral: number;
    VarargLiteral: number;
  };

  export const errors: {
    unexpected: string;
    expected: string;
    expectedToken: string;
    unfinishedString: string;
    malformedNumber: string;
    invalidVar: string;
    decimalEscapeTooLarge: string;
    invalidEscape: string;
    hexadecimalDigitExpected: string;
    braceExpected: string;
    tooLargeCodepoint: string;
    unfinishedLongString: string;
    unfinishedLongComment: string;
  };

  export const ast: {
    labelStatement(label: string): LuaNode;
    breakStatement(): LuaNode;
    gotoStatement(label: string): LuaNode;
    returnStatement(args: LuaNode[]): LuaNode;
    ifStatement(clauses: LuaNode[]): LuaNode;
    ifClause(condition: LuaNode, body: LuaNode[]): LuaNode;
    elseifClause(condition: LuaNode, body: LuaNode[]): LuaNode;
    elseClause(body: LuaNode[]): LuaNode;
    whileStatement(condition: LuaNode, body: LuaNode[]): LuaNode;
    doStatement(body: LuaNode[]): LuaNode;
    repeatStatement(condition: LuaNode, body: LuaNode[]): LuaNode;
    localStatement(variables: LuaNode[], init: LuaNode[]): LuaNode;
    assignmentStatement(variables: LuaNode[], init: LuaNode[]): LuaNode;
    callStatement(expression: LuaNode): LuaNode;
    functionStatement(
      identifier: LuaNode | undefined,
      parameters: LuaNode[],
      isLocal: boolean,
      body: LuaNode[],
    ): LuaNode;
    forNumericStatement(
      variable: LuaNode,
      start: LuaNode,
      end: LuaNode,
      step: LuaNode | undefined,
      body: LuaNode[],
    ): LuaNode;
    forGenericStatement(variables: LuaNode[], iterators: LuaNode[], body: LuaNode[]): LuaNode;
    chunk(body: LuaNode[]): LuaNode;
    identifier(name: string): LuaNode;
    literal(type: number, value?: string | number | boolean | null, raw?: string): LuaNode;
    tableKey(key: LuaNode, value: LuaNode): LuaNode;
    tableKeyString(key: LuaNode, value: LuaNode): LuaNode;
    tableValue(value: LuaNode): LuaNode;
    tableConstructorExpression(fields: LuaNode[]): LuaNode;
    binaryExpression(
      operator:
        | 'or'
        | 'and'
        | '<'
        | '>'
        | '<='
        | '>='
        | '~='
        | '=='
        | '|'
        | '~'
        | '&'
        | '<<'
        | '>>'
        | '..'
        | '+'
        | '-'
        | '*'
        | '/'
        | '//'
        | '%'
        | '^',
      left: LuaNode,
      right: LuaNode,
    ): LuaNode;
    unaryExpression(operator: 'not' | '#' | '-' | '~', argument: LuaNode): LuaNode;
    memberExpression(base: LuaNode, indexer: '.' | ':', identifier: LuaNode): LuaNode;
    indexExpression(base: LuaNode, index: LuaNode): LuaNode;
    callExpression(base: LuaNode, args: LuaNode[]): LuaNode;
    tableCallExpression(base: LuaNode, args: LuaNode[]): LuaNode;
    stringCallExpression(base: LuaNode, args: LuaNode[]): LuaNode;
    comment(value: string, raw?: string): LuaNode;
  };
  export function parse(input: string, options: LuaparseOptions): LuaNode;
}
