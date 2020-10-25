import syntaxDecorators from '@babel/plugin-syntax-decorators';
import splitExportDeclaration from '@babel/helper-split-export-declaration';
import { template, types as t } from '@babel/core';

export default function(api, { automaticParentheses = false }) {
  if (typeof automaticParentheses !== 'boolean') {
    throw new TypeError("'automaticParentheses' must be a boolean.");
  }

  function prop(k, v) {
    if (!v) return null;
    return t.objectProperty(t.identifier(k), v);
  }

  function value(body, params = []) {
    return t.objectMethod('method', t.identifier('value'), params, body);
  }

  function extractDecorators({ node }) {
    let result;
    if (node.decorators && node.decorators.length > 0) {
      result = t.arrayExpression(
        node.decorators.map(
          decorator =>
            automaticParentheses || decorator.arguments
              ? t.callExpression(decorator.callee, decorator.arguments || [])
              : decorator.callee,
        ),
      );
    }
    node.decorators = undefined;
    return result;
  }

  function getKey(node) {
    return node.computed ? node.key : t.stringLiteral(node.key.name || String(node.key.value));
  }

  function getSingleElementDefinition(path, superRef, classRef, file) {
    const { node } = path;
    const isMethod = path.isClassMethod();

    new ReplaceSupers(
      {
        superRef,
        file,
        methodPath: path,
        methodNode: node,
        objectRef: classRef,
        isStatic: node.static,
        scope: path.scope,
      },
      true,
    ).replace();

    const properties = [
      prop('kind', t.stringLiteral(isMethod ? node.kind : 'field')),
      prop('decorators', extractDecorators(path)),
      prop('static', node.static && t.booleanLiteral(true)),
      prop('key', getKey(node)),
      isMethod ? value(node.body, node.params) : value(template.ast`{ return ${node.value} }`),
    ].filter(Boolean);

    return t.objectExpression(properties);
  }

  function getElementsDefinitions(path, fId, file) {
    const superRef = path.node.superClass || t.identifier('Function');

    const elements = [];
    for (const p of path.get('body.body')) {
      if (!p.isClassMethod({ kind: 'constructor' })) {
        elements.push(getSingleElementDefinition(p, superRef, fId, file));
        p.remove();
      }
    }

    return t.arrayExpression(elements);
  }

  function getConstructorPath(path) {
    return path.get('body.body').find(p => p.isClassMethod({ kind: 'constructor' }));
  }

  const bareSupersVisitor = {
    CallExpression(path, { initializeInstanceElements }) {
      if (path.get('callee').isSuper()) {
        path.insertAfter(t.cloneNode(initializeInstanceElements));
      }
    },
    Function(path) {
      if (!path.isArrowFunctionExpression()) path.skip();
    },
  };

  function insertInitializeInstanceElements(path, initializeInstanceId) {
    const isBase = !path.node.superClass;
    const initializeInstanceElements = t.callExpression(initializeInstanceId, [t.thisExpression()]);

    const constructorPath = getConstructorPath(path);
    if (constructorPath) {
      if (isBase) {
        constructorPath
          .get('body')
          .unshiftContainer('body', [t.expressionStatement(initializeInstanceElements)]);
      } else {
        constructorPath.traverse(bareSupersVisitor, {
          initializeInstanceElements,
        });
      }
    } else {
      const constructor = isBase
        ? t.classMethod(
            'constructor',
            t.identifier('constructor'),
            [],
            t.blockStatement([t.expressionStatement(initializeInstanceElements)]),
          )
        : t.classMethod(
            'constructor',
            t.identifier('constructor'),
            [t.restElement(t.identifier('args'))],
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(t.Super(), [t.spreadElement(t.identifier('args'))]),
              ),
              t.expressionStatement(initializeInstanceElements),
            ]),
          );
      path.node.body.body.push(constructor);
    }
  }

  function transformClass(path) {
    path.node.type = 'ClassDeclaration';
    if (!path.node.id) path.node.id = path.scope.generateUidIdentifier('class');

    const initializeId = path.scope.generateUidIdentifier('initialize');

    const classDecorators = extractDecorators(path);
    const definitions = getElementsDefinitions(path, path.node.id);

    insertInitializeInstanceElements(path, initializeId);

    const isDerived = path.node.superClass != null;
    const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__class'));
    return template.expression.ast`
    ${helper}(
      ${classDecorators || t.nullLiteral()},
      function (${isDerived ? `${path.node.superClass.id}, ` : ''}${initializeId}) {
        ${path.node}
        return { F: ${t.cloneNode(path.node.id)}, d: ${definitions} };
      },
      ${path.node.superClass.id}
    )
  `;
  }

  return {
    inherits: syntaxDecorators,

    visitor: {
      /**
       * @param {import("babel-traverse").NodePath<t.ClassDeclaration>} path
       */
      ClassDeclaration(path) {
        if (path.parentPath.isExportDefaultDeclaration()) {
          if (!path.node.id) {
            t.toExpression(path.node);
            path.replaceWith(transformClass(path));
            return;
          }

          path = splitExportDeclaration(path.parentPath);
        }

        path.replaceWith(
          t.variableDeclaration('let', [
            t.variableDeclarator(t.cloneNode(path.node.id), transformClass(path)),
          ]),
        );
      },

      ClassExpression(path) {
        path.replaceWith(transformClass(path));
      },

      NewExpression(path) {
        const { node } = path;
        const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__new'));

        node.arguments.unshift(node.callee);
        path.replaceWith(t.callExpression(helper, node.arguments));
      },

      BinaryExpression(path) {
        const { node } = path;
        if (node.operator !== 'instanceof') return;
        const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__instanceof'));

        path.replaceWith(t.callExpression(helper, [node.left, node.right]));
      },
    },
  };
}
