const { code2data, data2code } = require("../selectors");
const { getDiffs } = require("../helpers");

test("code2data simple root selector", () => {
  const code = `
const UserSelector = state => state.user;
const BobSelector = function(state) {
  return state.bob;
}
function UserIdSelector(state) {
  return state.user.id;
}
  `;
  expect(code2data(code)).toEqual({
    rootSelectors: ["UserSelector", "BobSelector", "UserIdSelector"],
    selectors: []
  });
});

test("code2data simple selector", () => {
  const code = `
const TodoCountSelector = createSelector(
  TodoItemsSelector,
  (todoItem) => todoItem.length
);
  `;
  expect(code2data(code)).toEqual({
    rootSelectors: [],
    selectors: [{ input: ["TodoItemsSelector"], output: "TodoCountSelector" }]
  });
});

test("code2data multiple selector", () => {
  const code = `
const TodoCountSelector = createSelector(
  TodoItemsSelector,
  (todoItem) => todoItem.length
);
const MySelector = createSelector(
  XyzSelector,
  AbcSelector,
  ZzzSelector,
  (xyz, acb, zzz) => Object.assign({}, xyz, abc, zzz)
)
  `;
  expect(code2data(code)).toEqual({
    rootSelectors: [],
    selectors: [
      { input: ["TodoItemsSelector"], output: "TodoCountSelector" },
      {
        input: ["XyzSelector", "AbcSelector", "ZzzSelector"],
        output: "MySelector"
      }
    ]
  });
});

test("data2code add createSelector to empty file", () => {
  const code = `
const { createSelector } = require("reselect");

module.exports = {};
  `;
  const left = [
    {
      selectors: []
    }
  ];
  const right = [
    {
      selectors: [{ input: ["TodoItemsSelector"], output: "TodoCountSelector" }]
    }
  ];
  const expectedCode = `
const { createSelector } = require("reselect");

const TodoCountSelector = createSelector(TodoItemsSelector, todoItems => {
  return;
});
module.exports = {};`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code add createSelector", () => {
  const code = `
const TodoCountSelector = createSelector(
  TodoItemsSelector,
  (todoItem) => todoItem.length
);
  `;
  const left = [
    {
      selectors: [{ input: ["TodoItemsSelector"], output: "TodoCountSelector" }]
    }
  ];
  const right = [
    {
      selectors: [
        { input: ["TodoItemsSelector"], output: "TodoCountSelector" },
        {
          input: ["XyzSelector", "AbcSelector", "ZzzSelector"],
          output: "MySelector"
        }
      ]
    }
  ];
  const expectedCode = `
const TodoCountSelector = createSelector(TodoItemsSelector, todoItem => todoItem.length);
const MySelector = createSelector(XyzSelector, AbcSelector, ZzzSelector, (xyz, abc, zzz) => {
  return;
});`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code add input to createSelector", () => {
  const code = `
const TodoCountSelector = createSelector(
  TodoItemsSelector,
  (todoItem) => todoItem.length
);
  `;
  const left = [
    {
      selectors: [{ input: ["TodoItemsSelector"], output: "TodoCountSelector" }]
    }
  ];
  const right = [
    {
      selectors: [
        {
          input: ["TodoItemsSelector", "AbcSelector"],
          output: "TodoCountSelector"
        }
      ]
    }
  ];
  const expectedCode = `
const TodoCountSelector = createSelector(TodoItemsSelector, AbcSelector, (todoItem, abc) => todoItem.length);`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code modify input/output", () => {
  const code = `
const TodoCountSelector = createSelector(TodoItemsSelector, AbcSelector, (todoItem, abc) => todoItem.length);`;

  const left = [
    {
      selectors: [
        {
          input: ["TodoItemsSelector", "AbcSelector"],
          output: "TodoCountSelector"
        }
      ]
    }
  ];
  const right = [
    {
      selectors: [
        {
          input: ["TodoItemsSelector", "XyzSelector"],
          output: "TodoXyzSelector"
        }
      ]
    }
  ];
  const expectedCode = `
const TodoXyzSelector = createSelector(TodoItemsSelector, XyzSelector, (todoItem, xyz) => todoItem.length);`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code delete selector", () => {
  const code = `
const TodoCountSelector = createSelector(TodoItemsSelector, todoItem => todoItem.length);
const MySelector = createSelector(XyzSelector, AbcSelector, ZzzSelector, (xyz, abc, zzz) => {
  return;
});`;
  const left = [
    {
      selectors: [
        { input: ["TodoItemsSelector"], output: "TodoCountSelector" },
        {
          input: ["XyzSelector", "AbcSelector", "ZzzSelector"],
          output: "MySelector"
        }
      ]
    }
  ];
  const right = [
    {
      selectors: [{ input: ["TodoItemsSelector"], output: "TodoCountSelector" }]
    }
  ];
  const expectedCode = `
const TodoCountSelector = createSelector(TodoItemsSelector, todoItem => todoItem.length);`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code delete input to createSelector", () => {
  const code = `
const TodoCountSelector = createSelector(TodoItemsSelector, AbcSelector, (todoItem, abc) => todoItem.length);`;
  const left = [
    {
      selectors: [
        {
          input: ["TodoItemsSelector", "AbcSelector"],
          output: "TodoCountSelector"
        }
      ]
    }
  ];
  const right = [
    {
      selectors: [
        {
          input: ["TodoItemsSelector"],
          output: "TodoCountSelector"
        }
      ]
    }
  ];
  const expectedCode = `
const TodoCountSelector = createSelector(TodoItemsSelector, todoItem => todoItem.length);`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code add root selector to empty file", () => {
  const code = `
const { createSelector } = require("reselect");

module.exports = {};
  `;
  const left = [
    {
      rootSelectors: []
    }
  ];
  const right = [
    {
      rootSelectors: ["AbcSelector"]
    }
  ];
  const expectedCode = `
const { createSelector } = require("reselect");

const AbcSelector = state => state.abc;

module.exports = {};`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code add root selector", () => {
  const code = `
const AbcSelector = state => state.abc;`;
  const left = [
    {
      rootSelectors: ["AbcSelector"]
    }
  ];
  const right = [
    {
      rootSelectors: ["AbcSelector", "XyzSelector"]
    }
  ];
  const expectedCode = `
const AbcSelector = state => state.abc;

const XyzSelector = state => state.xyz;`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code modify root selector", () => {
  const code = `
const AbcSelector = state => state.abc;`;
  const left = [
    {
      rootSelectors: ["AbcSelector"]
    }
  ];
  const right = [
    {
      rootSelectors: ["XyzSelector"]
    }
  ];
  const expectedCode = `
const XyzSelector = state => state.abc;`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code delete root selector", () => {
  const code = `
const AbcSelector = state => state.abc;`;
  const left = [
    {
      rootSelectors: ["AbcSelector"]
    }
  ];
  const right = [
    {
      rootSelectors: []
    }
  ];
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe("");
});
