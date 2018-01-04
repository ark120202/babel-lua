import normalizeOptions from 'babel-plugin-module-resolver/lib/normalizeOptions';
import transformCall from 'babel-plugin-module-resolver/lib/transformers/call';
import transformImport from 'babel-plugin-module-resolver/lib/transformers/import';
import createResolver from './resolver';

const importVisitors = {
  CallExpression: transformCall,
  'ImportDeclaration|ExportDeclaration': transformImport,
};

const visitor = {
  Program: {
    enter(programPath, state) {
      programPath.traverse(importVisitors, state);
    },
  },
};

export default ({ types }) => ({
  name: 'module-resolver',

  pre(file) {
    this.types = types;

    this.normalizedOpts = normalizeOptions(file.opts.filename, this.opts);

    const { luaRoot } = this.opts;
    if (luaRoot == null) throw new Error('Required option `luaRoot` is not defined');

    const optionalResolvePath = this.opts.resolvePath;
    this.normalizedOpts.resolvePath = createResolver(luaRoot, optionalResolvePath);
  },

  visitor,
});
