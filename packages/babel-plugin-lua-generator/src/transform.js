/* @flow */

import * as _ from 'lodash';
import * as t from 'lua-types';
import * as transformers from './transformers';

class Transformer {
  _parent: Object;

  transform(node: Object, parent?: Object): t.LuaNode | t.LuaNode[] {
    if (node == null) return node;
    const { type } = node;

    const nodeTransform = transformers[type];
    if (!nodeTransform) {
      // FIXME: Use path.buildCodeFrameError
      throw new Error(
        `Transform for ${type} node not found. Make sure to have a plugin to support that syntax.`,
      );
    }
    if (!parent) parent = this._parent;

    this._parent = node;
    const transformedNode = nodeTransform.call(this, node, parent);
    this._parent = parent;

    this._reattachShared(transformedNode, node);

    return transformedNode;
  }

  _reattachShared(transformedNode: t.LuaNode, node: Object) {
    if (Array.isArray(transformedNode)) {
      transformedNode.forEach(n => {
        n.loc = node.loc;
        n._compact = node._compact;
      });
    } else {
      transformedNode.loc = node.loc;
      transformedNode._compact = node._compact;
    }
  }

  transformList(list, parent = this._parent) {
    return list.reduce((acc, node) => {
      const transformed = this.transform(node, parent);
      if (Array.isArray(transformed)) {
        acc.push(...transformed);
      } else {
        acc.push(transformed);
      }
      return acc;
    }, []);
  }

  transformBlock(node) {
    if (node.type === 'BlockStatement') return this.transformList(node.body);
    return _.castArray(this.transform(node));
  }
}

export default function transform(ast: t.LuaNode) {
  return new Transformer().transform(ast);
}
