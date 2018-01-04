import path from 'path';
import { resolvePath } from 'babel-plugin-module-resolver';

export default function createResolver(luaRoot, optionalResolvePath) {
  const pathSepRegExp = new RegExp(`\\${path.sep}`, 'g');
  return (sourcePath, currentFile, opts) => {
    if (optionalResolvePath != null) return optionalResolvePath(sourcePath, currentFile, opts);

    const resolvedPath = resolvePath(sourcePath, currentFile, opts);

    // Module
    if (resolvedPath == null) {
      return `node_modules.${path.normalize(sourcePath).replace(pathSepRegExp, '.')}`;
    }

    const realPath = path.resolve(path.dirname(currentFile), resolvedPath);
    let rootRelativePath = path.relative(luaRoot, realPath);

    // Cut off extension
    if (path.extname(rootRelativePath)) {
      const { dir, name } = path.parse(rootRelativePath);
      rootRelativePath = path.join(dir, name);
    }

    // Lua path should be resolved
    if (rootRelativePath.split(pathSepRegExp).some(p => p.includes('.'))) {
      // FIXME: Use path.buildCodeFrameError
      throw new Error(`Path "${sourcePath}" is invalid. Resolved path shouldn't contain dots`);
    }

    // Not required, but lua supports it
    return rootRelativePath.replace(pathSepRegExp, '.');
  };
}
