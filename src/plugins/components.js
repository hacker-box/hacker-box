const { default: traverse } = require("babel-traverse");
const template = require("babel-template");
const t = require("babel-types");
const { parse, generate, lastRequire, firstExports } = require("./helpers");
const DOMFactories = require("react/lib/ReactDOMFactories");

function code2data(code) {
  const ast = parse(code);
  const components = [];
  const connect = [];
  const mapFunctions = [];

  traverse(ast, {
    JSXElement: {
      enter(path) {
        if (path.findParent(p => p.isJSXElement())) {
          return;
        }
        const component = path.findParent(p => p.isClassDeclaration()) ||
          path.findParent(p => p.isVariableDeclarator()) ||
          path.findParent(p => p.isFunctionDeclaration());

        if (!component) {
          return;
        }
        const name = component.get("id").node.name;
        const functional = !component.isClassDeclaration();
        const children = [];
        path.traverse({
          JSXOpeningElement: {
            enter(jPath) {
              const tagName = jPath.get("name").node.name;
              if (!DOMFactories[tagName]) {
                children.push(jPath.get("name").node.name);
              }
            }
          }
        });
        const existingComp = components.find(comp => comp.name === name);
        if (existingComp) {
          existingComp.children = existingComp.children.concat(children);
        } else {
          components.push({ name, children, functional });
        }
      }
    },
    FunctionParent: {
      enter(path) {
        const params = path.get("params");
        if (!params || params.length !== 1) {
          return;
        }
        if (params[0].isIdentifier({ name: "state" })) {
          const mapStateToProps = {};
          path.traverse({
            ObjectExpression: {
              enter(oPath) {
                if (!oPath.parentPath.isReturnStatement()) {
                  return;
                }
                oPath.get("properties").forEach(prop => {
                  const key = prop.get("key").node.name;
                  const value = prop.get("value");
                  if (value.isCallExpression) {
                    mapStateToProps[key] = value.get("callee").node.name;
                  }
                });
              }
            }
          });
          mapFunctions.push({
            name: path.get("id").node.name,
            map: mapStateToProps
          });
        }

        if (params[0].isIdentifier({ name: "dispatch" })) {
          const mapDispatchToProps = {};
          path.traverse({
            ObjectExpression: {
              enter(oPath) {
                if (!oPath.parentPath.isReturnStatement()) {
                  return;
                }
                oPath.get("properties").forEach(prop => {
                  const key = prop.get("key").node.name;
                  const values = [];
                  oPath.traverse({
                    CallExpression: {
                      enter(cPath) {
                        if (
                          !cPath
                            .get("callee")
                            .isIdentifier({ name: "dispatch" })
                        ) {
                          return;
                        }
                        const arg0 = cPath.get("arguments")[0];
                        if (!arg0 || !arg0.isCallExpression()) {
                          return;
                        }
                        const action = arg0.get("callee");
                        if (action.isMemberExpression()) {
                          values.push(
                            [
                              action.get("object").node.name,
                              action.get("property").node.name
                            ].join(".")
                          );
                        }
                        if (action.isIdentifier()) {
                          values.push(action.node.name);
                        }
                      }
                    }
                  });
                  mapDispatchToProps[key] = values;
                });
              }
            }
          });
          mapFunctions.push({
            name: path.get("id").node.name,
            map: mapDispatchToProps
          });
        }
      }
    },
    CallExpression: {
      enter(path) {
        if (
          !path.get("callee").isIdentifier({ name: "connect" }) ||
          !path.parentPath.isCallExpression()
        ) {
          return;
        }
        const [stateFn, dispatchFn] = path
          .get("arguments")
          .map(arg => arg.node.name);
        const stateConnect = mapFunctions.find(con => con.name === stateFn);
        const dispatchConnect = mapFunctions.find(
          con => con.name === dispatchFn
        );
        if (stateConnect || dispatchConnect) {
          connect.push({
            component: path.parentPath.get("arguments")[0].node.name,
            state: stateConnect,
            dispatch: dispatchConnect
          });
        }
      }
    }
  });

  return {
    components,
    connect
  };
}

function enterComponentDeclaration(ast, index, callback) {
  let idx = 0;
  const compNames = [];
  traverse(ast, {
    JSXElement: {
      enter(path) {
        if (path.findParent(p => p.isJSXElement())) {
          return;
        }
        const component = path.findParent(p => p.isClassDeclaration()) ||
          path.findParent(p => p.isVariableDeclarator()) ||
          path.findParent(p => p.isFunctionDeclaration());

        if (!component) {
          return;
        }
        const name = component.get("id").node.name;
        if (!compNames.includes(name)) {
          if (idx === index) {
            callback.call(this, component);
          }
          compNames.push(name);
          idx++;
        }
      }
    }
  });
}

function genNewComponent({ name, functional }) {
  if (functional) {
    const funcCompBuilder = template(
      `
const FUNCTION_NAME = (props) => {
  const {} = props;
  return (
    <div/>
  )
}
`
    );
    return funcCompBuilder({
      FUNCTION_NAME: t.identifier(name)
    });
  }

  const compBuilder = template(
    `
class COMPONENT_NAME extends React.Component {
  render() {
    const {} = this.props;
    return (EMPTY_DIV);
  }
}
`
  );
  return compBuilder({
    COMPONENT_NAME: t.identifier(name),
    EMPTY_DIV: t.jSXElement(
      t.jSXOpeningElement(t.JSXIdentifier("div"), [], true),
      null,
      [],
      true
    )
  });
}

function componentAdded(ast, diff) {
  if (diff.path.length !== 2) {
    return;
  }
  const newComp = genNewComponent(diff.value);
  if (diff.leftKey === 0) {
    lastRequire(ast, lastReq => {
      lastReq.insertAfter(newComp);
    });
    return;
  }

  enterComponentDeclaration(ast, diff.leftKey - 1, comp => {
    const componentPath = comp.isVariableDeclarator()
      ? comp.findParent(p => p.isVariableDeclaration())
      : comp;
    componentPath.insertAfter(newComp);
  });
}

function compToFunc(compName, compPath) {
  const render = compPath
    .get("body")
    .get("body")
    .find(
      cls =>
        cls.isClassMethod() && cls.get("key").isIdentifier({ name: "render" })
    );
  if (!render) {
    console.warn(`Not able to find render() for component ${name}`);
    return;
  }
  compPath.traverse({
    MemberExpression: {
      enter(mPath) {
        if (
          !mPath.get("object").isThisExpression() ||
          !mPath.get("property").isIdentifier({ name: "props" })
        ) {
          return;
        }
        // replace this.props to props;
        mPath.replaceWith(t.identifier("props"));
      }
    }
  });
  const funcBuilder = template(
    `
const FUNCTION_NAME = props => FUNCTION_BODY
    `
  );
  return funcBuilder({
    FUNCTION_NAME: t.identifier(compName),
    FUNCTION_BODY: render.get("body").node
  });
}

function funcToComp(funcName, compPath) {
  let body = null;
  compPath.traverse({
    VariableDeclarator: {
      enter(vPath) {
        const init = vPath.get("init");
        if (!init || !init.isIdentifier({ name: "props" })) {
          return;
        }
        // replace props with this.props
        init.replaceWith(
          t.memberExpression(t.thisExpression(), t.identifier("props"))
        );
      }
    },
    Function: {
      enter(fPath) {
        const bodyPath = fPath.get("body");
        body = bodyPath.isBlockStatement()
          ? bodyPath.node.body
          : t.returnStatement(bodyPath.node);
      }
    }
  });

  if (!body) {
    console.warn(`Not able to find function body ${funcName}`);
    return;
  }

  const compBuilder = template(
    `
    class COMPONENT_NAME extends React.Component {
      render() {
        RENDER_BODY
      }
    }
    `
  );

  return compBuilder({
    COMPONENT_NAME: t.identifier(funcName),
    RENDER_BODY: body
  });
}

function componentModified(ast, diff) {
  const [, , componentIndex] = diff.path;
  enterComponentDeclaration(ast, parseInt(componentIndex, 10), comp => {
    if (diff.leftKey === "name") {
      const idPath = comp.get("id");
      if (idPath.node.name !== diff.value) {
        idPath.replaceWith(t.identifier(diff.value));
      }
    }
    if (diff.leftKey === "functional") {
      const name = comp.get("id").node.name;
      if (diff.value) {
        if (comp.isVariableDeclaration()) {
          return;
        }
        const funcComp = compToFunc(name, comp);
        if (funcComp) {
          comp.replaceWith(funcComp);
        }
      } else {
        if (comp.isClassDeclaration()) {
          return;
        }
        const classComp = funcToComp(name, comp);
        if (classComp) {
          comp.parentPath.replaceWith(classComp);
        }
      }
    }
  });
}

function componentDeleted(ast, diff) {
  enterComponentDeclaration(ast, diff.leftKey, comp => {
    const componentPath = comp.isVariableDeclarator()
      ? comp.findParent(p => p.isVariableDeclaration())
      : comp;
    componentPath.remove();
  });
}

const patchComponentCode = ast =>
  diff => {
    switch (diff.action) {
      case "added":
        componentAdded(ast, diff);
        break;
      case "modified":
        componentModified(ast, diff);
        break;
      case "deleted":
        componentDeleted(ast, diff);
        break;
      default:
    }
  };

function genConnect(connect) {
  const functionBuilder = template(
    `
    function FUNCTION_NAME(ARG) {
      return OBJECT_EXPRESSION;
    }
    `
  );

  const connectStatements = [];

  if (connect.state) {
    const stateMap = t.ObjectExpression(
      Object.keys(connect.state.map || {}).map(prop =>
        t.objectProperty(
          t.identifier(prop),
          t.callExpression(t.identifier(connect.state.map[prop]), [
            t.identifier("state")
          ])
        ))
    );

    connectStatements.push(
      functionBuilder({
        FUNCTION_NAME: t.identifier(connect.state.name),
        ARG: t.identifier("state"),
        OBJECT_EXPRESSION: stateMap
      })
    );
  }

  if (connect.dispatch) {
    const dispatchBuilder = template("() => dispatch(ACTION)");
    const dispatchMap = t.ObjectExpression(
      Object.keys(connect.dispatch.map || {}).map(prop => {
        const [memObject, memProp] = connect.dispatch.map[prop][0].split(".");
        return t.objectProperty(
          t.identifier(prop),
          dispatchBuilder({
            ACTION: t.callExpression(
              memProp
                ? t.memberExpression(
                    t.identifier(memObject),
                    t.identifier(memProp)
                  )
                : t.identifier(memObject),
              []
            )
          }).expression
        );
      })
    );

    connectStatements.push(
      functionBuilder({
        FUNCTION_NAME: t.identifier(connect.dispatch.name),
        ARG: t.identifier("dispatch"),
        OBJECT_EXPRESSION: dispatchMap
      })
    );
  }

  const connectBuilder = template(
    `
    const COMPONENT_NAME = connect(MAP_STATE, MAP_DISPATCH)(_COMPONENT_NAME);
    `
  );
  connectStatements.push(
    connectBuilder({
      COMPONENT_NAME: t.identifier(connect.component),
      MAP_STATE: t.identifier(connect.state.name),
      MAP_DISPATCH: t.identifier(connect.dispatch.name),
      _COMPONENT_NAME: t.identifier(`_${connect.component}`)
    })
  );

  return connectStatements;
}

function connectAdded(ast, diff) {
  if (diff.path.length === 2) {
    let idx = ast.program.body.length - 1;
    firstExports(ast, path => idx = path.key - 1);
    traverse(ast, {
      Program: {
        enter(path) {
          path.get("body")[idx].insertAfter(genConnect(diff.value));
        }
      }
    });
  }
}

function connectModified(ast, diff) {}

function connectDeleted(ast, diff) {}

const patchConnectCode = ast =>
  diff => {
    switch (diff.action) {
      case "added":
        connectAdded(ast, diff);
        break;
      case "modified":
        connectModified(ast, diff);
        break;
      case "deleted":
        connectDeleted(ast, diff);
        break;
      default:
    }
  };

function data2code(code, diffs) {
  const ast = parse(code);
  const componentDiffs = diffs.filter(diff => diff.path[1] === "components");
  const connectDiffs = diffs.filter(diff => diff.path[1] === "connect");
  componentDiffs.forEach(patchComponentCode(ast));
  connectDiffs.forEach(patchConnectCode(ast));
  return generate(ast);
}

const newFileContent = memo => ({
  ...memo,
  components: {
    doc: `
[
  { requires: [{ module: "react", variables: ["React"] }] },
  {
    components: [{ name: "_MyComponent", children: [], functional: false }],
    connect: [
      {
        component: "_MyComponent",
        state: { name: "mapStateToProps", map: { user: "UserSelector" } },
        dispatch: {
          name: "mapDispatchToProps",
          map: { getUser: ["Action.getCurrentUser"] }
        }
      }
    ]
  },
  { exports: [] }
]`,
    src: `
const React = require("react");
`
  }
});

module.exports = {
  code2data,
  data2code,
  newFileContent
};
