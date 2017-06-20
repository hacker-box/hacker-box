const jsTraverse = require("traverse");
const strEscape = require("js-string-escape");
const fakerDefs = require("./fakerDefs");
const fakerProxy = require("./fakerProxy");
const { filter } = require("fuzzaldrin");
const { default: traverse } = require("babel-traverse");
const { parse, generate, reverseCamelCase } = require("./helpers");

function genFaker(key, value) {
  if (key !== "0") {
    const keys = reverseCamelCase(key).toLowerCase().split("_");
    const match = keys.reduce(
      (matchArr, splitKey) =>
        matchArr.concat(
          filter(fakerDefs, splitKey, { key: "keyword", maxResults: 1 })
        ),
      []
    );
    if (match.length > 0) {
      return match[0].fakerFn;
    }
  }

  let fakerFn;
  switch (typeof value) {
    case "boolean": {
      fakerFn = "random.boolean";
      break;
    }
    case "number": {
      fakerFn = "random.number";
      break;
    }
    case "string": {
      fakerFn = value.indexOf(" ") === -1 ? "random.word" : "random.words";
      break;
    }
    default: {
      fakerFn = "lorem.sentence";
    }
  }
  return fakerFn;
}

function genFakerCode(jsObj) {
  const code = ["const data = "];

  jsTraverse(jsObj).forEach(function genCode(node) {
    // process only the first item in array.
    if (Array.isArray(this.parent && this.parent.node) && this.key !== "0") {
      this.update(null, true);
    } else if (Array.isArray(node)) {
      this.before(() =>
        code.push(
          node.length ? `Array(${node.length}).fill().map( ()=>(` : "["
        ));
      this.after(() => code.push(node.length ? "))" : "]"));
    } else if (typeof node === "object") {
      this.before(() => code.push("{"));
      this.pre((x, key) => {
        genCode.call(this, key);
        code.push(":");
      });
      this.post(child => {
        if (!child.isLast) {
          code.push(",");
        }
      });
      this.after(() => code.push("}"));
    } else if (this.isLeaf) {
      code.push(`faker.${genFaker(this.key, node)}()`);
    } else if (typeof node === "string") {
      code.push('"');
      code.push(strEscape(node.toString()));
      code.push('"');
    } else {
      code.push(node.toString());
    }
  });
  return parse(code.join(""));
}

function data2code(code, diffs, left, right) {
  const fakerJson = right.find(item => item.faker);
  const fakerAst = genFakerCode(fakerJson ? fakerJson.faker : []);
  const ast = parse(code);
  let replaced = false;
  traverse(ast, {
    VariableDeclarator: {
      enter(path) {
        if (!path.get("id").isIdentifier({ name: "data" })) {
          return;
        }
        if (replaced) {
          return;
        }
        const vardecs = path.findParent(p => p.isVariableDeclaration());
        if (vardecs) {
          replaced = true;
          vardecs.replaceWith(fakerAst);
        }
      }
    }
  });
  return generate(ast);
}

function code2data(code) {
  const modProxy = {};
  const reqProxy = () => fakerProxy; //FIXME: all requires return faker proxy.
  try {
    const modFunc = new Function(["require", "module"], code); //eslint-disable-line
    modFunc(reqProxy, modProxy);
  } catch (e) {
    console.error(e);
  }
  return { faker: modProxy.exports || "[]" };
}

const newFileContent = memo => ({
  ...memo,
  faker: {
    doc: `
This module helps create fake server response for the WEBAPI.

Cut and Paste the output from the server inside faker: [] item.
Hint: Use Swagger, Postman or Curl to get the output from the server.

It will generate the code needed to produce fake endpoint.
  `,
    src: `
const faker = require("faker");

const data = [];

module.exports = data;
`
  }
});

module.exports = {
  data2code,
  code2data,
  newFileContent
};
