const { format } = require("./ActionFormatter");
const jsondiffpatch = require("jsondiffpatch");

test("test empty format", () => {
  const actions = format({}, {});
  expect(actions).toEqual([]);
});

test("test added", () => {
  const left = {
    require: {}
  };
  const right = {
    require: {
      superagent: "request"
    }
  };
  const delta = jsondiffpatch.diff(left, right);
  const actions = format(delta, left);
  expect(actions).toEqual([
    {
      action: "added",
      key: "superagent",
      value: "request",
      leftKey: "superagent",
      parentNodeType: "object",
      path: ["require"]
    }
  ]);
});

test("test modified", () => {
  const left = {
    require: {
      superagent: "superagent"
    }
  };
  const right = {
    require: {
      superagent: "request"
    }
  };
  const delta = jsondiffpatch.diff(left, right);
  const actions = format(delta, left);
  expect(actions).toEqual([
    {
      action: "modified",
      key: "superagent",
      value: "request",
      leftKey: "superagent",
      parentNodeType: "object",
      path: ["require"]
    }
  ]);
});
