const { code2data, data2code } = require("../requireModule");
const { getDiffs } = require("../helpers");

test("code2data - test simple require", () => {
  const code = `
      const request = require("superagent");
    `;
  expect(code2data(code)).toEqual({
    requires: [{ module: "superagent", variables: "request" }]
  });
});

test("code2data - destructured require", () => {
  const code = `
      const {Button, Icon} = require("react-toolbox");
    `;
  expect(code2data(code)).toEqual({
    requires: [{ module: "react-toolbox", variables: ["Button", "Icon"] }]
  });
});

test("Test simple require() add", () => {
  const code = `
  const {createselector} = require("reselect");
`;

  const expectedCode = `
const { createselector } = require("reselect");

const _get = require("lodash.get");`;

  const newCode = data2code(code, [
    {
      action: "added",
      leftKey: 1,
      path: ["0", "requires"],
      value: {
        module: "lodash.get",
        variables: "_get"
      }
    }
  ]);
  expect(newCode).toBe(expectedCode);
});

test("Test destructured require() add", () => {
  const code = `
  const {createselector} = require("reselect");
`;

  const expectedCode = `
const { createselector } = require("reselect");

const {
  get,
  orderBy
} = require("lodash");`;

  const newCode = data2code(code, [
    {
      action: "added",
      leftKey: 1,
      path: ["0", "requires"],
      value: {
        module: "lodash",
        variables: ["get", "orderBy"]
      }
    }
  ]);
  expect(newCode).toBe(expectedCode);
});

test("Test modified variables with object destructuring", () => {
  const code = `
  const {createselector} = require("reselect");
`;

  const expectedCode = `
const {
  createSelector
} = require("reselect");`;

  const newCode = data2code(code, [
    {
      action: "modified",
      leftKey: 0,
      path: ["0", "requires", "0", "variables"],
      value: "createSelector"
    }
  ]);
  expect(newCode).toBe(expectedCode);
});

test("Test modified variables", () => {
  const code = `
  const get = require("lodash.get");
`;

  const expectedCode = `
const _get = require("lodash.get");`;

  const newCode = data2code(code, [
    {
      action: "modified",
      leftKey: 0,
      path: ["0", "requires", "0", "variables"],
      value: "_get"
    }
  ]);
  expect(newCode).toBe(expectedCode);
});

test("Test modified module", () => {
  const code = `
  const reslect = require("reelect");
`;

  const expectedCode = `
const reslect = require("reselect");`;

  const newCode = data2code(code, [
    {
      action: "modified",
      leftKey: "module",
      path: ["0", "requires", "0"],
      value: "reselect"
    }
  ]);
  expect(newCode).toBe(expectedCode);
});

test("Test single to multi variable change", () => {
  const code = `
  const rt = require("react-toolbox");
`;

  const expectedCode = `
const {
  Button,
  Icon
} = require("react-toolbox");`;

  const newCode = data2code(code, [
    {
      action: "modified",
      key: "0",
      value: "Button",
      leftKey: 0,
      parentNodeType: "array",
      path: ["0", "requires", "0", "variables"]
    },
    {
      action: "added",
      key: "1",
      value: "Icon",
      leftKey: 1,
      parentNodeType: "array",
      path: ["0", "requires", "0", "variables"]
    }
  ]);
  expect(newCode).toBe(expectedCode);
});

test("Test add to multi variable", () => {
  const code = `
  const {Button, Icon} = require("react-toolbox");
`;

  const expectedCode = `
const { Button, Icon, Menu
} = require("react-toolbox");`;

  const newCode = data2code(code, [
    {
      action: "added",
      key: "2",
      value: "Menu",
      leftKey: 2,
      parentNodeType: "array",
      path: ["0", "requires", "0", "variables"]
    }
  ]);
  expect(newCode).toBe(expectedCode);
});

test("Test delete multi variable", () => {
  const code = `
  const {Button, Icon, Menu} = require("react-toolbox");
`;

  const expectedCode = `
const { Button, Menu } = require("react-toolbox");`;

  const newCode = data2code(code, [
    {
      action: "deleted",
      key: "_1",
      leftKey: 1,
      parentNodeType: "array",
      path: ["0", "requires", "0", "variables"],
      value: "Icon"
    }
  ]);
  expect(newCode).toBe(expectedCode);
});

test("Test multi variable value change", () => {
  const code = `
  const { default: generate } = require("babel-generator");
`;

  const expectedCode = `
const {
  default: generator
} = require("babel-generator");`;

  const newCode = data2code(code, [
    {
      action: "modified",
      key: "0",
      leftKey: 0,
      parentNodeType: "array",
      path: ["0", "requires", "0", "variables"],
      value: "generator"
    }
  ]);
  expect(newCode).toBe(expectedCode);
});

test("data2code: requires first", () => {
  const code = "";
  const left = [{ requires: [] }];
  const right = [{ requires: [{ module: "zzz", variables: "zzz" }] }];
  const expectedCode = `const zzz = require("zzz");`;

  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});
