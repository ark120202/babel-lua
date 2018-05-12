import path from 'path';
import { NodeJsInputFileSystem, CachedInputFileSystem, ResolverFactory } from 'enhanced-resolve';
import { findImports, replaceImports, LuaModuleResolverPlugin } from '../src';

describe('findImports', () => {
  test('should parse with double quotes', () => {
    expect(findImports(`require("module")`)).toEqual(['module']);
  });
  test('should parse with single quotes', () => {
    expect(findImports(`require('module')`)).toEqual(['module']);
  });
  test('should parse without braces', () => {
    expect(findImports(`require "module"`)).toEqual(['module']);
  });
  test('should parse multiple imports', () => {
    expect(findImports(`require("module")\nrequire("module2")`)).toEqual(['module', 'module2']);
  });
  test('should allow spaces inside statement', () => {
    expect(findImports(`require  (   "module" ) `)).toEqual(['module']);
    expect(findImports(`require  (   'module' ) `)).toEqual(['module']);
    expect(findImports(`require   "module" `)).toEqual(['module']);
    expect(findImports(`require   'module' `)).toEqual(['module']);
  });
});

describe('replaceImports', () => {
  test('should replace imports', () => {
    expect(replaceImports(`require("module")`, () => 'new_module')).toBe(`require("new_module")`);
  });

  test('should normalize expression syntax', () => {
    expect(replaceImports(`require  'module'`, () => 'new_module')).toBe(`require("new_module")`);
  });

  test('should use replacer', () => {
    const source = `require("module");  require("another_module")`;
    const result = `require("module2");  require("another_module2")`;
    expect(replaceImports(source, m => `${m}2`)).toBe(result);
  });

  test('should support errors', () => {
    const source = `require("module")`;
    const result = `--[[ require("module") ]] error("Couldn't resolve module \\"module\\"")`;
    expect(replaceImports(source, m => new Error(`Couldn't resolve module "${m}"`))).toBe(result);
  });
});

describe('LuaModuleResolverPlugin', () => {
  const luaRoot = __dirname;
  const localRoot = path.resolve(__dirname, '..');
  const context = path.join(__dirname, 'fixtures');
  const resolver = ResolverFactory.createResolver({
    extensions: ['.js', '.lua'],
    fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000),
    plugins: [new LuaModuleResolverPlugin(localRoot, luaRoot)],
    useSyncFileSystemCalls: true,
  });
  const resolve = request => resolver.resolveSync({}, context, request);

  test('should resolve relative to luaRoot', () => {
    expect(resolve('./test.js')).toBe('fixtures.test');
  });

  test('should resolve .lua and .js', () => {
    expect(resolve('./test.js')).toBe('fixtures.test');
    expect(resolve('./test.lua')).toBe('fixtures.test');
  });

  test('should resolve node modules', () => {
    expect(resolve('enhanced-resolve')).toBe('node_modules.enhanced-resolve.lib.node');
  });

  test("shouldn't resolve paths outside of luaRoot", () => {
    expect(() => resolve('../../package.json')).toThrow();
  });

  test("shouldn't resolve paths with dots", () => {
    expect(() => resolve('./file.name.lua')).toThrow();
  });
});
