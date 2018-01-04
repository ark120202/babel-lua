const RESERVED_WORDS_LUA: Set<string> = new Set([
  'and',
  'break',
  'do',
  'else',
  'elseif',
  'end',
  'false',
  'for',
  'function',
  'goto',
  'if',
  'in',
  'local',
  'nil',
  'not',
  'or',
  'repeat',
  'return',
  'then',
  'true',
  'until',
  'while',
]);

export default function() {
  return {
    visitor: {
      'BindingIdentifier|ReferencedIdentifier': function BRIdentifier(path) {
        if (RESERVED_WORDS_LUA.has(path.node.name)) {
          path.scope.rename(path.node.name);
        }
      },
    },
  };
}
