import * as t from 'lua-types';
import luaparse from 'luaparse';

export default function parse(input, options = {}) {
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
