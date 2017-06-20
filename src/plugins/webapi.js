const { default: traverse } = require("babel-traverse");
const template = require("babel-template");
const t = require("babel-types");
const { parse, generate, lastRequire } = require("./helpers");

function enterWapiCall(ast, callback) {
  let idx = 0;
  traverse(ast, {
    MemberExpression: {
      enter(path) {
        if (
          !path.get("object").isIdentifier({ name: "request" }) ||
          !path.parentPath.isCallExpression()
        ) {
          return;
        }
        callback.call(this, path, idx);
        idx++;
      }
    }
  });
}

function getUrl(path) {
  if (path.isStringLiteral()) {
    return path.node.value;
  }
  if (path.isTemplateLiteral()) {
    const quasis = path.get("quasis");
    const exps = path.get("expressions");
    return quasis.reduce(
      (str, quasi, idx) =>
        idx === 0
          ? quasi.node.value.raw
          : `${str}${quasi.node.value.raw}\${${exps[idx - 1].node.name}}`,
      ""
    );
  }
}

function code2data(code) {
  const webapis = [];
  const ast = parse(code);
  enterWapiCall(ast, path => {
    const verb = path.get("property").node.name;
    const url = getUrl(path.parentPath.get("arguments")[0]);
    const funcParent = path.findParent(p => p.isFunctionParent());
    const name = funcParent.isFunctionDeclaration()
      ? funcParent.get("id").node.name
      : funcParent
          .findParent(p => p.isVariableDeclarator())
          .get("id").node.name;
    webapis.push({ verb, url, name });
  });

  return { webapis };
}

function genWebapi({ name, verb, url }) {
  const webapiBuilder = template(
    `
    const FUNCTION_NAME = () => request.VERB(URL).accept("json").type("json").then(res => res.body);
    `
  );
  return webapiBuilder({
    FUNCTION_NAME: t.identifier(name),
    VERB: t.identifier(verb),
    URL: t.stringLiteral(url)
  });
}

function webapiAdded(ast, diff) {
  if (diff.path.length === 2) {
    if (diff.leftKey === 0) {
      lastRequire(ast, path => {
        path.insertAfter(genWebapi(diff.value));
      });
    } else {
      enterWapiCall(ast, (path, idx) => {
        if (diff.leftKey !== idx + 1) {
          return;
        }
        const prevWapi = path.findParent(p => p.isFunctionDeclaration()) ||
          path.findParent(p => p.isVariableDeclaration());
        if (!prevWapi) {
          console.warn(
            `Not able to find pevious wapi at index ${diff.leftKey}`
          );
          return;
        }
        prevWapi.insertAfter(genWebapi(diff.value));
      });
    }
  }
}

function webapiModified(ast, diff) {
  const [, , webapiIdx] = diff.path;
  const webapiIndex = parseInt(webapiIdx, 10);
  enterWapiCall(ast, (path, idx) => {
    if (idx !== webapiIndex) {
      return;
    }
    if (diff.leftKey === "name") {
      const funcParent = path.findParent(p => p.isFunctionParent());
      const idPath = funcParent.isFunctionDeclaration()
        ? funcParent.get("id")
        : funcParent.findParent(p => p.isVariableDeclarator()).get("id");
      if (idPath.node.name !== diff.value) {
        idPath.replaceWith(t.identifier(diff.value));
      }
      return;
    }
    if (diff.leftKey === "verb") {
      const propPath = path.get("property");
      if (propPath.node.name !== diff.value) {
        propPath.replaceWith(t.identifier(diff.value));
      }
      return;
    }
    if (diff.leftKey === "url") {
      const urlPath = path.parentPath.get("arguments")[0];
      // FIXME: handle templates
      if (
        urlPath &&
        urlPath.isStringLiteral() &&
        urlPath.node.value !== diff.value
      ) {
        urlPath.replaceWith(t.stringLiteral(diff.value));
      }
      return;
    }
  });
}

function webapiDeleted(ast, diff) {
  if (diff.path.length === 2) {
    enterWapiCall(ast, (path, idx) => {
      if (idx === diff.leftKey) {
        const parent = path.findParent(p => p.isFunctionDeclaration()) ||
          path.findParent(p => p.isVariableDeclaration());
        if (!parent) {
          console.warn(`Not able to find webapi at index ${idx}`);
          return;
        }
        parent.remove();
      }
    });
    return;
  }
}

const patchWebApi = ast =>
  diff => {
    switch (diff.action) {
      case "added":
        webapiAdded(ast, diff);
        break;
      case "modified":
        webapiModified(ast, diff);
        break;
      case "deleted":
        webapiDeleted(ast, diff);
        break;
      default:
    }
  };

function data2code(code, diffs) {
  const ast = parse(code);
  const webapiDiffs = diffs.filter(diff => diff.path[1] === "webapis");
  webapiDiffs.forEach(patchWebApi(ast));
  return generate(ast);
}

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

const updateExport = (newName, idx) =>
  data => {
    const exportsItem = data.find(item => item.exports);
    if (!exportsItem) {
      console.warn("Not able to file exports block in data", data, newName);
      return data;
    }

    exportsItem.exports.splice(idx, 1, newName);
    return data;
  };

function suggestions(memo, file) {
  const suggestions = [];
  const { fileId, action: diff } = memo.update;
  const { action, path, value, leftKey } = diff;
  const [, codeType] = path;
  if (codeType !== "webapis") {
    return memo;
  }
  if (path.length === 2) {
    if (fileId === file.uid) {
      if (action === "added") {
        suggestions.push({
          action: addExport(value.name),
          caption: `Add "${value.name}" to exports`
        });
      } else if (action === "deleted") {
        suggestions.push({
          action: removeExport(value.name),
          caption: `Remove "${value.name}" from exports`
        });
      }
    }
  }
  if (path.length === 3 && action === "modified") {
    if (leftKey === "name") {
      suggestions.push({
        action: updateExport(value, parseInt(path[2], 10)),
        caption: `Update export name to "${value}""`
      });
    }
  }
  return {
    ...memo,
    suggestions: memo.suggestions.concat(suggestions)
  };
}

const newFileContent = memo => ({
  ...memo,
  webapi: {
    doc: `
[
  {
    requires: [
      { module: "superagent", variables: ["request"] }
    ]
  },
  {
    webapis: [
      { verb: "get", url: "/api/user", name: "getUserInfo" },
      { verb: "post", url: "/api/item", name: "createItem" }
    ]
  },
  { exports: ["getUserInfo", "createItem"] }
]`,
    src: `
const request = require("superagent");

module.exports = {
};
`
  }
});

module.exports = {
  code2data,
  data2code,
  suggestions,
  newFileContent
};
