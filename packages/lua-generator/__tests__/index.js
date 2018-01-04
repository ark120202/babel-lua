/* @flow */

import luaParse from 'lua-parse';
import fs from 'fs-extra';
import path from 'path';
import { types } from 'lua-types';
import generate from '../src';
import Printer from '../src/printer';

const readFile = async p => (await fs.readFile(p, 'utf8')).trim().replace(/\r\n/g, '\n');

describe('lua-generator', () => {
  test('completeness', () => {
    types.forEach(type => {
      expect(Printer.prototype).toHaveProperty(type);
    });

    Object.keys(Printer.prototype).forEach(type => {
      if (!/[A-Z]/.test(type[0])) return;
      expect(types).toContain(type);
    });
  });

  xdescribe('multiple sources', () => {
    const sources = {
      'a.js': 'function hi (msg) console.log(msg) end\n',
      'b.js': "hi('hello')\n",
    };
    const parsed = Object.keys(sources).reduce((_parsed, filename) => {
      luaParse(0);
      _parsed[filename] = luaParse(sources[filename], {
        sourceFilename: filename,
        locations: true,
      });
      return _parsed;
    }, {});

    const combinedAst = {
      type: 'Chunk',
      body: [].concat(parsed['a.js'].body, parsed['b.js'].body),
    };

    const generated = generate(combinedAst, { sourceMaps: true }, sources);

    test('code', () => {
      console.log(generated.code);
      expect(generated.code).toEqual('function hi(msg)\n    console.log(msg);\nend\nhi("hello");');
    });

    test('sourcemap', () => {
      expect(generated.map).toEqual({
        version: 3,
        sources: ['a.js', 'b.js'],
        mappings:
          'AAAA,SAASA,EAAT,CAAaC,GAAb,EAAkB;AAAEC,UAAQC,GAAR,CAAYF,GAAZ;AAAmB;;ACAvCD,GAAG,OAAH',
        names: ['hi', 'msg', 'console', 'log'],
        sourcesContent: ['function hi (msg) console.log(msg) end\n', "hi('hello')\n"],
      });
    });
    test('raw mappings', () => {
      expect(generated.rawMappings).toEqual([
        {
          name: undefined,
          generated: { line: 1, column: 0 },
          source: 'a.js',
          original: { line: 1, column: 0 },
        },
        {
          name: 'hi',
          generated: { line: 1, column: 9 },
          source: 'a.js',
          original: { line: 1, column: 9 },
        },
        {
          name: undefined,
          generated: { line: 1, column: 11 },
          source: 'a.js',
          original: { line: 1, column: 0 },
        },
        {
          name: 'msg',
          generated: { line: 1, column: 12 },
          source: 'a.js',
          original: { line: 1, column: 13 },
        },
        {
          name: undefined,
          generated: { line: 1, column: 15 },
          source: 'a.js',
          original: { line: 1, column: 0 },
        },
        {
          name: undefined,
          generated: { line: 1, column: 17 },
          source: 'a.js',
          original: { line: 1, column: 18 },
        },
        {
          name: 'console',
          generated: { line: 2, column: 0 },
          source: 'a.js',
          original: { line: 1, column: 20 },
        },
        {
          name: 'log',
          generated: { line: 2, column: 10 },
          source: 'a.js',
          original: { line: 1, column: 28 },
        },
        {
          name: undefined,
          generated: { line: 2, column: 13 },
          source: 'a.js',
          original: { line: 1, column: 20 },
        },
        {
          name: 'msg',
          generated: { line: 2, column: 14 },
          source: 'a.js',
          original: { line: 1, column: 32 },
        },
        {
          name: undefined,
          generated: { line: 2, column: 17 },
          source: 'a.js',
          original: { line: 1, column: 20 },
        },
        {
          name: undefined,
          generated: { line: 3, column: 0 },
          source: 'a.js',
          original: { line: 1, column: 39 },
        },
        {
          name: 'hi',
          generated: { line: 5, column: 0 },
          source: 'b.js',
          original: { line: 1, column: 0 },
        },
        {
          name: undefined,
          generated: { line: 5, column: 3 },
          source: 'b.js',
          original: { line: 1, column: 3 },
        },
        {
          name: undefined,
          generated: { line: 5, column: 10 },
          source: 'b.js',
          original: { line: 1, column: 0 },
        },
      ]);
    });
  });

  describe('generate', () => {
    fs.readdirSync(path.join(__dirname, 'fixtures')).forEach(group => {
      const fixtures = fs.readdirSync(path.join(__dirname, 'fixtures', group));
      const config = fs.readJSONSync(path.join(__dirname, 'fixtures', group, 'options.json'));
      describe(group, () => {
        fixtures.forEach(fixture => {
          if (fixture !== 'options.json') {
            test(fixture.replace('.lua', ''), async () => {
              const code = await readFile(path.join(__dirname, 'fixtures', group, fixture));
              const ast = luaParse(code, { luaVersion: '5.3', locations: true });
              const serialized = generate(ast, config, code);
              expect(serialized.code).toBe(code);
            });
          }
        });
      });
    });
  });
});
