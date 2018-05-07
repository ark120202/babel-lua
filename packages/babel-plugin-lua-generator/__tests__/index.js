import luaparse from 'luaparse';
import fs from 'fs-extra';
import path from 'path';
import * as babylon from 'babylon';
import * as _ from 'lodash';
import generate from 'lua-generator';
import transform from '../src/transform';

const readFile = async p => (await fs.readFile(p, 'utf8')).trim().replace(/\r\n/g, '\n');

function deepPick(collection, predicate) {
  return _.transform(collection, (memo, val, key) => {
    const include = predicate(val, key);
    if (include) {
      if (_.isObject(val)) val = deepPick(val, predicate);
      memo[key] = val;
    }
  });
}

function deepMap(obj, iterator, context) {
  return _.transform(obj, (result, val, key) => {
    result[key] = _.isObject(val)
      ? deepMap(val, iterator, context)
      : iterator.call(context, val, key);
  });
}

describe('babel-generator-lua', () => {
  describe('transforms', () => {
    fs
      .readdirSync(path.join(__dirname, 'fixtures'))
      .filter(group => !group.startsWith('_'))
      .forEach(group => {
        it(group, async () => {
          const directory = path.join(__dirname, 'fixtures', group);
          const [js, lua] = await Promise.all([
            readFile(path.join(directory, 'actual.js')),
            readFile(path.join(directory, 'expected.lua')),
          ]);

          let jsAst = babylon.parse(js);
          jsAst = transform(jsAst);
          jsAst = deepPick(jsAst, (val, key) => key !== 'loc');

          let luaAst = luaparse.parse(lua, { luaVersion: '5.3' });
          luaAst = deepMap(luaAst, (val, key) => (key === 'raw' ? undefined : val));
          delete luaAst.comments;

          try {
            expect(jsAst).toEqual(luaAst);
          } catch (err) {
            expect(generate(jsAst).code).toEqual(generate(luaAst).code);
          }
        });
      });
  });
});
