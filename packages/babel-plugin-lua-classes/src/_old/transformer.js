import nameFunction from '@babel/helper-function-name';
import ReplaceSupers from '@babel/helper-replace-supers';
import * as defineMap from '@babel/helper-define-map';
import { traverse, template, types as t } from '@babel/core';

const noMethodVisitor = {
  'FunctionExpression|FunctionDeclaration': function Function(path) {
    path.skip();
  },

  Method(path) {
    path.skip();
  },
};

const verifyConstructorVisitor = traverse.visitors.merge([
  noMethodVisitor,
  {
    CallExpression: {
      exit(path) {
        if (path.get('callee').isSuper()) {
          this.hasBareSuper = true;

          if (!this.isDerived) {
            throw path.buildCodeFrameError('super() is only allowed in a derived constructor');
          }
        }
      },
    },

    ThisExpression(path) {
      if (this.isDerived) {
        if (path.parentPath.isMemberExpression({ object: path.node })) {
          // In cases like this.foo or this[foo], there is no need to add
          // assertThisInitialized, since they already throw if this is
          // undefined.
          return;
        }

        const helper = t.memberExpression(
          t.identifier('Reflect'),
          t.identifier('__assertThisInitialized'),
        );
        const assertion = t.callExpression(helper, [path.node]);
        path.replaceWith(assertion);
        path.skip();
      }
    },
  },
]);

const findThisesVisitor = traverse.visitors.merge([
  noMethodVisitor,
  {
    ThisExpression(path) {
      this.superThises.push(path);
    },
  },
]);

export default class ClassTransformer {
  constructor(path, file) {
    this.parent = path.parent;
    this.scope = path.scope;
    this.node = path.node;
    this.path = path;
    this.file = file;

    this.clearDescriptors();

    this.instancePropBody = [];
    this.instancePropRefs = {};
    this.staticPropBody = [];
    this.body = [];

    this.bareSupers = [];

    this.pushedConstructor = false;
    this.pushedInherits = false;

    this.superThises = [];

    // class id
    this.classId = this.node.id;

    // this is the name of the binding that will **always** reference the class we've constructed
    this.classRef = this.node.id
      ? t.identifier(this.node.id.name)
      : this.scope.generateUidIdentifier('class');

    this.superName = this.node.superClass;
    this.isDerived = !!this.node.superClass;
  }

  run() {
    let { superName } = this;

    const constructorBody = t.blockStatement([]);
    this.constructorBody = constructorBody;
    this.constructor = this.buildConstructor();

    const closureParams = [];
    const closureArgs = [];

    if (this.isDerived) {
      closureArgs.push(t.cloneNode(superName));

      superName = this.scope.generateUidIdentifierBasedOnNode(superName);
      closureParams.push(superName);

      this.superName = t.cloneNode(superName);
    }

    this.buildBody();

    const container = t.functionExpression(null, closureParams, t.blockStatement(this.body));
    return t.callExpression(container, closureArgs);
  }

  buildConstructor() {
    const func = t.functionExpression(null, [], this.constructorBody);
    t.inherits(func, this.node);
    return func;
  }

  pushToMap(node, enumerable, kind = 'value', scope) {
    let mutatorMap;
    if (node.static) {
      this.hasStaticDescriptors = true;
      mutatorMap = this.staticMutatorMap;
    } else {
      this.hasInstanceDescriptors = true;
      mutatorMap = this.instanceMutatorMap;
    }

    const map = defineMap.push(mutatorMap, node, kind, this.file, scope);

    if (enumerable) {
      map.enumerable = t.booleanLiteral(true);
    }

    return map;
  }

  /**
   * Make sure that derived class always has a constructor with super call
   */
  constructorMeMaybe() {
    const paths = this.path.get('body.body');
    const hasConstructor = paths.some(path => path.equals('kind', 'constructor'));
    if (hasConstructor) return;

    let params;
    let body;

    if (this.isDerived) {
      const constructor = template.expression.ast`
        (function (...args) {
          super(...args);
        })
      `;
      ({ params, body } = constructor);
    } else {
      params = [];
      body = t.blockStatement([]);
    }

    this.path
      .get('body')
      .unshiftContainer(
        'body',
        t.classMethod('constructor', t.identifier('constructor'), params, body),
      );
  }

  buildBody() {
    this.body.push(
      t.variableDeclaration('var', [
        t.variableDeclarator(
          t.cloneNode(this.classRef),
          t.objectExpression([t.objectProperty(t.identifier('prototype'), t.objectExpression([]))]),
        ),
      ]),
    );
    this.pushInherits();

    this.constructorMeMaybe();
    this.pushBody();
    this.verifyConstructor();

    if (this.userConstructor) {
      const { constructorBody } = this;
      constructorBody.body = constructorBody.body.concat(this.userConstructor.body.body);
      t.inherits(this.constructor, this.userConstructor);
      t.inherits(constructorBody, this.userConstructor.body);
    }

    this.pushDescriptors();

    this.body = this.body.concat(this.staticPropBody.map(fn => fn(t.cloneNode(this.classRef))));

    this.pushReturn();
  }

  pushBody() {
    const classBodyPaths = this.path.get('body.body');

    classBodyPaths.forEach(path => {
      const { node } = path;

      if (path.isClassProperty()) {
        throw path.buildCodeFrameError('Missing class properties transform.');
      }

      if (node.decorators) {
        throw path.buildCodeFrameError(
          'Method has decorators, put the decorator plugin before the classes one.',
        );
      }

      if (t.isClassMethod(node)) {
        const isConstructor = node.kind === 'constructor';

        if (isConstructor) {
          path.traverse(verifyConstructorVisitor, this);
        }

        const replaceSupers = new ReplaceSupers(
          {
            forceSuperMemoisation: isConstructor,
            methodPath: path,
            methodNode: node,
            objectRef: this.classRef,
            superRef: this.superName,
            inConstructor: isConstructor,
            isStatic: node.static,
            scope: this.scope,
            file: this.file,
          },
          true,
        );

        replaceSupers.replace();

        if (isConstructor) {
          this.pushConstructor(replaceSupers, node, path);
        } else {
          this.pushMethod(node, path);
        }
      }
    });
  }

  clearDescriptors() {
    this.hasInstanceDescriptors = false;
    this.hasStaticDescriptors = false;

    this.instanceMutatorMap = {};
    this.staticMutatorMap = {};
  }

  pushDescriptors() {
    const { body } = this;

    let instanceProps;
    let staticProps;

    if (this.hasInstanceDescriptors) {
      instanceProps = defineMap.toClassObject(this.instanceMutatorMap);
    }

    if (this.hasStaticDescriptors) {
      staticProps = defineMap.toClassObject(this.staticMutatorMap);
    }

    if (instanceProps || staticProps) {
      if (instanceProps) {
        instanceProps = defineMap.toComputedObjectFromClass(instanceProps);
      }
      if (staticProps) {
        staticProps = defineMap.toComputedObjectFromClass(staticProps);
      }

      let args = [
        t.cloneNode(this.classRef), // Constructor
        t.nullLiteral(), // instanceDescriptors
        t.nullLiteral(), // staticDescriptors
        t.nullLiteral(), // instanceInitializers
        t.nullLiteral(), // staticInitializers
      ];

      if (instanceProps) args[1] = instanceProps;
      if (staticProps) args[2] = staticProps;

      if (this.instanceInitializersId) {
        args[3] = this.instanceInitializersId;
        body.unshift(this.buildObjectAssignment(this.instanceInitializersId));
      }

      if (this.staticInitializersId) {
        args[4] = this.staticInitializersId;
        body.unshift(this.buildObjectAssignment(this.staticInitializersId));
      }

      let lastNonNullIndex = 0;
      args.forEach((arg, i) => {
        if (!t.isNullLiteral(arg)) lastNonNullIndex = i;
      });
      args = args.slice(0, lastNonNullIndex + 1);

      const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__createClass'));
      body.push(t.expressionStatement(t.callExpression(helper, args)));
    }

    this.clearDescriptors();
  }

  buildObjectAssignment(id) {
    return t.variableDeclaration('var', [t.variableDeclarator(id, t.objectExpression([]))]);
  }

  wrapSuperCall(bareSuper, superRef, thisRef, body) {
    const bareSuperNode = bareSuper.node;

    bareSuperNode.arguments.unshift(t.thisExpression());
    if (
      bareSuperNode.arguments.length === 2 &&
      t.isSpreadElement(bareSuperNode.arguments[1]) &&
      t.isIdentifier(bareSuperNode.arguments[1].argument, {
        name: 'arguments',
      })
    ) {
      // special case single arguments spread
      bareSuperNode.arguments[1] = bareSuperNode.arguments[1].argument;
      bareSuperNode.callee = t.memberExpression(t.cloneNode(superRef), t.identifier('apply'));
    } else {
      bareSuperNode.callee = t.memberExpression(t.cloneNode(superRef), t.identifier('call'));
    }

    let call = t.logicalExpression('||', bareSuperNode, t.thisExpression());

    if (
      bareSuper.parentPath.isExpressionStatement() &&
      bareSuper.parentPath.container === body.node.body &&
      body.node.body.length - 1 === bareSuper.parentPath.key
    ) {
      // this super call is the last statement in the body so we can just straight up
      // turn it into a return

      if (this.superThises.length > 0) {
        call = t.assignmentExpression('=', thisRef(), call);
      }

      bareSuper.parentPath.replaceWith(t.returnStatement(call));
    } else {
      bareSuper.replaceWith(t.assignmentExpression('=', thisRef(), call));
    }
  }

  verifyConstructor() {
    if (!this.isDerived) return;

    const path = this.userConstructorPath;
    const body = path.get('body');

    path.traverse(findThisesVisitor, this);

    let guaranteedSuperBeforeFinish = !!this.bareSupers.length;

    const superRef = this.superName || t.identifier('Function');
    let thisRef = () => {
      const ref = path.scope.generateDeclaredUidIdentifier('this');
      thisRef = () => t.cloneNode(ref);
      return ref;
    };

    this.bareSupers.forEach(bareSuper => {
      this.wrapSuperCall(bareSuper, superRef, thisRef, body);

      if (guaranteedSuperBeforeFinish) {
        bareSuper.find(parentPath => {
          // hit top so short circuit
          if (parentPath === path) {
            return true;
          }

          if (
            parentPath.isLoop() ||
            parentPath.isConditional() ||
            parentPath.isArrowFunctionExpression()
          ) {
            guaranteedSuperBeforeFinish = false;
            return true;
          }

          return false;
        });
      }
    });

    this.superThises.forEach(thisPath => thisPath.replaceWith(thisRef()));

    const wrapReturn = returnArg => {
      const helper = t.memberExpression(
        t.identifier('Reflect'),
        t.identifier('__assertThisInitialized'),
      );
      const thisExpr = t.callExpression(helper, [thisRef()]);
      return returnArg ? t.logicalExpression('||', returnArg, thisExpr) : thisExpr;
    };

    // if we have a return as the last node in the body then we've already caught that
    // return
    const bodyPaths = body.get('body');
    if (bodyPaths.length === 0 || !bodyPaths.pop().isReturnStatement()) {
      body.pushContainer(
        'body',
        t.returnStatement(guaranteedSuperBeforeFinish ? thisRef() : wrapReturn()),
      );
    }

    this.superReturns.forEach(returnPath =>
      returnPath.get('argument').replaceWith(wrapReturn(returnPath.node.argument)),
    );
  }

  /**
   * Push a method to its respective mutatorMap.
   */

  pushMethod(node, path) {
    const scope = path ? path.scope : this.scope;

    if (node.kind === 'method' && this._processMethod(node, scope)) return;

    this.pushToMap(node, false, null, scope);
  }

  _insertProtoAliasOnce() {
    if (!this._protoAlias) {
      this._protoAlias = this.scope.generateUidIdentifier('proto');
      const classProto = t.memberExpression(this.classRef, t.identifier('prototype'));
      const protoDeclaration = t.variableDeclaration('var', [
        t.variableDeclarator(this._protoAlias, classProto),
      ]);

      this.body.push(protoDeclaration);
    }
  }

  _processMethod(node, scope) {
    if (!node.decorators) {
      // use assignments instead of define properties for loose classes

      let { classRef } = this;
      if (!node.static) {
        this._insertProtoAliasOnce();
        classRef = this._protoAlias;
      }
      const methodName = t.memberExpression(
        t.cloneNode(classRef),
        node.key,
        node.computed || t.isLiteral(node.key),
      );

      let func = t.functionExpression(
        null,
        node.params, // [t.identifier('this')].concat(node.params),
        node.body,
        node.generator,
        node.async,
      );
      func.returnType = node.returnType;
      const key = t.toComputedKey(node, node.key);
      if (t.isStringLiteral(key)) {
        func = nameFunction({
          node: func,
          id: key,
          scope,
        });
      }

      const expr = t.expressionStatement(t.assignmentExpression('=', methodName, func));
      t.inheritsComments(expr, node);
      this.body.push(expr);
      return true;
    }
    return false;
  }

  /**
   * Replace the constructor body of our class.
   */

  pushConstructor(replaceSupers, method, path) {
    this.bareSupers = replaceSupers.bareSupers;
    this.superReturns = replaceSupers.returns;

    // https://github.com/babel/babel/issues/1077
    if (path.scope.hasOwnBinding(this.classRef.name)) {
      path.scope.rename(this.classRef.name);
    }

    const construct = this.constructor;

    this.userConstructorPath = path;
    this.userConstructor = method;
    this.hasConstructor = true;

    t.inheritsComments(construct, method);

    construct.params = [t.identifier('this')].concat(method.params);

    t.inherits(construct.body, method.body);
    construct.body.directives = method.body.directives;

    // TODO: Fix it, push right after declaration
    // we haven't pushed any descriptors yet
    if (this.hasInstanceDescriptors || this.hasStaticDescriptors) {
      this.pushDescriptors();
    }
  }

  /**
   * Push inherits helper to body.
   */
  pushInherits() {
    if (!this.isDerived) return;

    const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__inherits'));
    // Unshift to ensure that the constructor inheritance is set up before
    // any properties can be assigned to the prototype.
    this.body.push(
      t.expressionStatement(
        t.callExpression(helper, [t.cloneNode(this.classRef), t.cloneNode(this.superName)]),
      ),
    );
  }

  pushReturn() {
    const helper = t.memberExpression(t.identifier('Reflect'), t.identifier('__makeConstructor'));
    const args = [t.cloneNode(this.classRef), this.constructor];
    if (this.isDerived) args.push(this.superName);
    this.body.push(t.returnStatement(t.callExpression(helper, args)));
  }
}
