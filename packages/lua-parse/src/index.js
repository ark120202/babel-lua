import * as t from 'lua-types';
import luaparse, { type LuaparseOptions } from 'luaparse';

interface LuaParseOptions extends LuaparseOptions {
  filename: string;
}

export default function parse(input: string, options: LuaParseOptions = {}) {
  const onCreateNode = options.locations
    ? node => {
        if (node.loc) {
          node.loc.filename = options.sourceFilename;
          if (t.isIdentifier(node)) {
            node.loc.identifierName = node.name;
          }
        }
        if (options.onCreateNode) options.onCreateNode(node);
      }
    : options.onCreateNode;
  return luaparse.parse(input, {
    ...options,
    onCreateNode,
  });
}
