const { BaseFormatter } = require("jsondiffpatch/src/formatters/base");

class DiffFormatter extends BaseFormatter {
  prepareContext = context => {
    BaseFormatter.prototype.prepareContext.call(this, context);
    context.path = [];
    context.nodeType = [];
  };

  rootBegin = () => {};
  rootEnd = () => {};
  nodeBegin = (context, key, leftKey, type, nodeType) => {
    if (type === "node") {
      context.path.push(key);
      context.nodeType.push(nodeType);
    }
  };
  nodeEnd = (context, key, leftKey, type, nodeType) => {
    if (type === "node") {
      context.path.pop(key);
      context.nodeType.push(nodeType);
    }
  };

  format_unchanged = () => {};
  format_movedestination = () => {};
  format_node = (context, delta, left) =>
    this.formatDeltaChildren(context, delta, left);

  format_textdiff = (context, delta, left, key, leftKey) =>
    context.out({
      action: "textdiff",
      key,
      leftKey,
      path: context.path.concat()
    });

  format_added = (context, delta, left, key, leftKey) =>
    context.out({
      action: "added",
      key,
      value: delta[0],
      leftKey,
      parentNodeType: context.nodeType[context.nodeType.length - 1],
      path: context.path.concat()
    });

  format_modified = (context, delta, left, key, leftKey) =>
    context.out({
      action: "modified",
      key,
      value: delta[1],
      leftKey,
      parentNodeType: context.nodeType[context.nodeType.length - 1],
      path: context.path.concat()
    });

  format_deleted = (context, delta, left, key, leftKey) =>
    context.out({
      action: "deleted",
      value: delta[0],
      key,
      leftKey,
      parentNodeType: context.nodeType[context.nodeType.length - 1],
      path: context.path.concat()
    });
  format_moved = (context, delta, left, key, leftKey) =>
    context.out({
      action: "moved",
      key,
      value: delta[1],
      leftKey,
      parentNodeType: context.nodeType[context.nodeType.length - 1],
      path: context.path.concat()
    });

  finalize = context => context.buffer;
}

let defaultInstance;

let format = (delta, left) => {
  if (!defaultInstance) {
    defaultInstance = new DiffFormatter();
  }
  return defaultInstance.format(delta, left);
};

module.exports = {
  format,
  DiffFormatter
};
