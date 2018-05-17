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
      const workdir = path.join(fixturesDir, fixture);
      const inputFile = path.join(workdir, 'input.js');
      const outputFile = path.join(workdir, 'output.js');
      const skipFile = path.join(workdir, 'skip');
      const configFileJS = path.join(workdir, 'config.js');
      const optionsFileJS = path.join(workdir, 'options.js');
      const optionsFileJSON = path.join(workdir, 'options.json');

      if (fs.isFileSync(skipFile)) {
        // eslint-disable-next-line jest/no-disabled-tests
        test.skip(fixture, () => {});
      } else {
        test(fixture, async () => {
          const input = await fs.readFile(inputFile);

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
          config.filename = inputFile;
          config.cwd = workdir;

          const pluginPath = path.join(pkgDir, 'src/index.js');

          if (!config.plugins) config.plugins = [];
          config.plugins.push([pluginPath, options]);

          const actualTransformed = transform(input, config).code.trim();

          if (!(await fs.isFile(outputFile))) {
            await fs.writeFile(outputFile, actualTransformed);
            console.warn(`Created fixture's expected file - ${outputFile}`);
          } else if (updateFixtures) {
            const expected = await fs.readFile(outputFile);
            if (expected !== actualTransformed) {
              await fs.writeFile(outputFile, actualTransformed);
              console.warn(`Updated fixture's expected file - ${outputFile}`);
            }
          } else {
            const output = (await fs.readFile(outputFile)).trim();
            expect(actualTransformed).toBe(output);
          }
        });
      }
    });
  });
}

export default testRunner;
