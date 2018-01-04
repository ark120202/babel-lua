type WhitespaceObject = {
  before?: boolean,
  after?: boolean,
};

export const nodes = {};

function TableKey(node: Object, parent): ?WhitespaceObject {
  if (parent.fields[0] === node) {
    return {
      before: true,
    };
  }
}
nodes.TableKey = TableKey;
nodes.TableKeyString = TableKey;
nodes.TableKeyString = TableKey;
nodes.TableValue = TableKey;

export const list = {};
