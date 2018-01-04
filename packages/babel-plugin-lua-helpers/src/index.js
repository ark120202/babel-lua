import * as helpers from 'babel-lua-helpers';

export default function() {
  return {
    pre(file) {
      file.set('helperGenerator', name => {
        const uid = file.scope.generateUidIdentifier(name);
        file.declarations[name] = uid;

        const dependencies = helpers.getDependencies(name).reduce((acc, dep) => {
          acc[dep] = file.addHelper(dep);
          return acc;
        }, {});

        const { nodes, globals } = helpers.get(
          name,
          dep => dependencies[dep],
          uid,
          Object.keys(file.scope.getAllBindings()),
        );

        globals.forEach(globalName => {
          if (file.path.scope.hasBinding(globalName, true /* noGlobals */)) {
            file.path.scope.rename(globalName);
          }
        });

        nodes.forEach(node => {
          node._compact = true;
        });

        file.path.unshiftContainer('body', nodes);
        // TODO: NodePath#unshiftContainer should automatically register new
        // bindings.
        file.path.get('body').forEach(path => {
          if (nodes.indexOf(path.node) === -1) return;
          if (path.isVariableDeclaration()) file.scope.registerDeclaration(path);
        });

        return uid;
      });
    },
  };
}
