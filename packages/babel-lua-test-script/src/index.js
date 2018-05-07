/**
 * Copy of https://github.com/babel/minify/blob/master/utils/test-runner/src/index.js
 * TODO: Migreate to @babel/helper-plugin-test-runner,
 * after https://github.com/babel/babel/pull/6179 will be resolved
 */

import path from 'path';
import { transform } from '@babel/core';
import * as fs from './fs';
import parseArgs from './argParser';

jest.setTimeout(25000);

function testRunner(dir) {
  const pkgDir = path.join(dir, '../');
  const packageJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json')));
  const pkgName = packageJson.name;

  const fixturesDir = path.join(pkgDir, '__tests__/fixtures');

  if (!fs.isDirectorySync(fixturesDir)) {
    // eslint-disable-next-line jest/no-disabled-tests
    describe.skip(pkgName);
    return;
  }

  const fixtures = fs
    .readdirSync(fixturesDir)
    .filter(fixture => fs.isDirectorySync(path.join(fixturesDir, fixture)));

  const flags = parseArgs(process.argv);
  const updateFixtures = Boolean(flags['update-fixtures']);

  describe(pkgName, () => {
    fixtures.forEach(fixture => {
      const actualFile = path.join(fixturesDir, fixture, 'actual.js');
      const expectedFile = path.join(fixturesDir, fixture, 'expected.js');
      const skipFile = path.join(fixturesDir, fixture, 'skip');
      const configFileJS = path.join(fixturesDir, fixture, 'config.js');
      const optionsFileJS = path.join(fixturesDir, fixture, 'options.js');
      const optionsFileJSON = path.join(fixturesDir, fixture, 'options.json');

      if (fs.isFileSync(skipFile)) {
        // eslint-disable-next-line jest/no-disabled-tests
        test.skip(fixture, () => {});
      } else {
        test(fixture, async () => {
          const actual = await fs.readFile(actualFile);

          let options = {};
          if (await fs.isFile(optionsFileJS)) {
            // eslint-disable-next-line import/no-dynamic-require
            options = require(optionsFileJS);
          } else if (await fs.isFile(optionsFileJSON)) {
            options = JSON.parse(await fs.readFile(optionsFileJSON));
          }
          let config = {};
          if (await fs.isFile(configFileJS)) {
            // eslint-disable-next-line import/no-dynamic-require
            config = require(configFileJS);
          }
          config.babelrc = false;
          config.filename = actualFile;

          const externalHelpers = require.resolve('@babel/plugin-external-helpers');
          const pluginPath = path.join(pkgDir, 'src/index.js');

          if (!config.plugins) config.plugins = [];
          config.plugins.push(externalHelpers, [pluginPath, options]);

          const actualTransformed = transform(actual, config).code.trim();

          if (!await fs.isFile(expectedFile)) {
            await fs.writeFile(expectedFile, actualTransformed);
            console.warn(`Created fixture's expected file - ${expectedFile}`);
          } else if (updateFixtures) {
            const expected = await fs.readFile(expectedFile);
            if (expected !== actualTransformed) {
              await fs.writeFile(expectedFile, actualTransformed);
              console.warn(`Updated fixture's expected file - ${expectedFile}`);
            }
          } else {
            const expected = (await fs.readFile(expectedFile)).trim();
            expect(actualTransformed).toBe(expected);
          }
        });
      }
    });
  });
}

export default testRunner;
