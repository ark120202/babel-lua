import path from 'upath';

export const REQUIRE_REGEXP = /require *(?:\( *'(.*?)' *\)|\( *"(.*?)" *\)| *'(.*?)'| *"(.*?)")/g;
export function findImports(code) {
  const requires = [];

  let groups = REQUIRE_REGEXP.exec(code);
  while (groups) {
    requires.push(groups[4] || groups[3] || groups[2] || groups[1]);
    groups = REQUIRE_REGEXP.exec(code);
  }

  return requires;
}

export function replaceImports(code, replacer) {
  return code.replace(REQUIRE_REGEXP, (source, m1, m2, m3, m4) => {
    const replacement = replacer(m4 || m3 || m2 || m1);
    return replacement instanceof Error
      ? `--[[ ${source} ]] error(${JSON.stringify(replacement.message)})`
      : `require("${replacement}")`;
  });
}

export function getRelativeLuaPath(luaRoot, filePath) {
  let result = path.relative(luaRoot, filePath);

  const upRelative = result.replace(/^(\.\.(\/|\\))*/, '');
  if (upRelative.startsWith('node_modules')) result = upRelative;

  if (result.startsWith('..') || path.isAbsolute(result)) {
    throw new Error(`Couldn't resolve path "${filePath}" within "${luaRoot}"`);
  }

  result = path.toUnix(path.trimExt(result));
  if (result.includes('.')) throw new Error(`Resolved path shouldn't contain dots`);

  return result;
}
