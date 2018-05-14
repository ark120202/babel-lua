import generate from 'lua-generator';
import transform from './transform';

export default function() {
  return {
    generatorOverride(ast, options, code) {
      const luaAst = transform(ast);
      if (Array.isArray(luaAst)) throw new Error('Unexpected array as transformation result');
      const lua = generate(luaAst, options, code);
      return lua;
    },
  };
}
