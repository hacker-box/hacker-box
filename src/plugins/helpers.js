const babylon = require("babylon");
const { default: generator } = require("babel-generator");
const { default: traverse } = require("babel-traverse");
const { format } = require("./DiffFormatter");
const jsondiffpatch = require("jsondiffpatch");
const _isEqual = require("lodash.isequal");

const babyOptions = {
  sourceType: "module",
  plugins: ["jsx", "classProperties"]
};
const genOptions = {
  comment: true,
  compact: false
};

function parse(code) {
  return babylon.parse(code, babyOptions);
}

function generate(ast) {
  return generator(ast, genOptions).code;
}

function enterCallWithNameIndex(ast, name, index, callback) {
  let idx = 0;
  const stopIndex = parseInt(index, 10);
  traverse(ast, {
    CallExpression: {
      enter(path) {
        if (!path.get("callee").isIdentifier({ name })) {
          return;
        }
        if (idx === stopIndex) {
          callback.call(this, path);
        }
        idx++;
      }
    }
  });
}

function numOfRequires(ast) {
  let idx = 0;
  traverse(ast, {
    CallExpression: {
      enter(path) {
        if (path.get("callee").isIdentifier({ name: "require" })) idx++;
      }
    }
  });
  return idx;
}

function lastRequire(ast, callback) {
  const noOfReqs = numOfRequires(ast);
  let called = false;
  let idx = 0;

  traverse(ast, {
    CallExpression: {
      enter(path) {
        idx++;
        if (
          path.get("callee").isIdentifier({ name: "require" }) &&
          idx === noOfReqs
        ) {
          called = true;
          callback.call(this, path.getStatementParent());
        }
      }
    },
    Program: {
      exit(path) {
        if (called) {
          return;
        }
        callback.call(this, null, path);
      }
    }
  });
}

function firstExports(ast, callback) {
  let called = false;
  traverse(ast, {
    AssignmentExpression: {
      enter(path) {
        if (called) {
          return;
        }
        const left = path.get("left");
        // exports =  --or-- module.exports =
        if (
          left.isIdentifier({ name: "exports" }) ||
          (left.isMemberExpression() &&
            left.get("object").isIdentifier({ name: "module" }) &&
            left.get("property").isIdentifier({ name: "exports" }))
        ) {
          callback.call(this, path.findParent(p => p.isExpressionStatement()));
          called = true;
        }
      }
    }
  });
}

function formatDelta(left, diffs) {
  const deltas = format(diffs, left);
  // compact array delete, replace to modified.
  return deltas
    .map((delta, idx) => {
      const next = deltas[idx + 1];
      if (
        next &&
        delta.parentNodeType === "array" &&
        delta.action === "deleted" &&
        next.action === "added" &&
        delta.path.join(".") === next.path.join(".") &&
        delta.leftKey === next.leftKey
      ) {
        next.action = "modified";
        delta.deleteMe = true;
      }
      return delta;
    })
    .filter(delta => delta.deleteMe !== true);
}

function getDiffs(left, right) {
  const delta = jsondiffpatch.diff(left, right);
  return formatDelta(left, delta);
}

const revCamelCaseRegEx = /([A-Z])/g;
const reverseCamelCase = name =>
  name.replace(revCamelCaseRegEx, "_$1").toUpperCase();

const getFileName = path => path.split("/").pop().split(".").shift();

const addExport = suggestion =>
  data => {
    const exportsItem = data.find(item => item.exports);
    if (!exportsItem) {
      console.warn("Not able to file exports block in data", data, suggestion);
      return data;
    }
    exportsItem.exports.push(suggestion);
    return data;
  };

const removeExport = suggestion =>
  data => {
    const exportsItem = data.find(item => item.exports);
    if (!exportsItem) {
      console.warn("Not able to file exports block in data", data, suggestion);
      return data;
    }
    const expIndex = exportsItem.exports.findIndex(exp => exp === suggestion);
    if (expIndex !== -1) {
      exportsItem.exports.splice(expIndex, 1);
    }
    return data;
  };

const addRequire = suggestion =>
  data => {
    const requiresItem = data.find(item => item.requires);
    if (!requiresItem) {
      console.warn("Not able to find requires block in data", data, suggestion);
      return data;
    }
    requiresItem.requires.push(suggestion);
    return data;
  };

const addRequireVariable = (idx, variable) =>
  data => {
    const requiresItem = ((data.find(d => !!d.requires) || {}).requires || [])[
      idx
    ];
    if (!requiresItem) {
      console.warn(
        "Not able to find requires block in data",
        data,
        idx,
        variable
      );
      return data;
    }
    requiresItem.variables.splice(0, 0, variable);
    return data;
  };

const removeRequire = suggestion =>
  data => {
    const requiresItem = data.find(item => item.requires);
    if (!requiresItem) {
      console.warn("Not able to file requires block in data", data, suggestion);
      return data;
    }
    const reqIndex = requiresItem.requires.findIndex(req =>
      _isEqual(req, suggestion));
    if (reqIndex !== -1) {
      requiresItem.requires.splice(reqIndex, 1);
    }
    return data;
  };

module.exports = {
  parse,
  generate,
  getDiffs,
  enterCallWithNameIndex,
  lastRequire,
  firstExports,
  reverseCamelCase,
  getFileName,
  addExport,
  removeExport,
  addRequire,
  removeRequire,
  addRequireVariable
};
