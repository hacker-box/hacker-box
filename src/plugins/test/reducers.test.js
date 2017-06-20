const { code2data, data2code } = require("../reducers");
const { getDiffs } = require("../helpers");

test("code2data: test reducers", () => {
  const code = `
  const reducers = handleActions({
    GET_CUSTOMER: receiveCustomer
  })
  `;
  expect(code2data(code)).toEqual({
    reducers: [{ key: "GET_CUSTOMER", value: "receiveCustomer" }]
  });
});

test("code2data: test reducers with next", () => {
  const code = `
  const reducers = handleActions({
    GET_CUSTOMER: {
      throw: handleError,
      next: receiveCustomer
    }
  })
  `;
  expect(code2data(code)).toEqual({
    reducers: [{ key: "GET_CUSTOMER", value: "receiveCustomer" }]
  });
});

test("data2code: test reducer add", () => {
  const code = `
const reducers = handleActions({});
  `;
  const left = [{ reducers: [] }];
  const right = [{ reducers: [{ key: "GET_USER", value: "getUser" }] }];
  const expectedCode = `const getUser = (state, {
  payload,
  error
}) => !error && update(state, {
  user: {
    $set: payload
  }
});

const reducers = handleActions({
  GET_USER: getUser
});`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: test reducer add", () => {
  const code = `
const {handleActions} = require("redux-actions");
const update = require("immutability-helper");

const defaultState = {
};

const actions = handleActions({
}, defaultState);

module.exports = actions;
  `;
  const left = [
    {
      requires: [
        { module: "redux-actions", variables: ["handleActions"] },
        { module: "immutability-helper", variables: "update" }
      ]
    },
    { reducers: [] },
    { exports: ["actions"] }
  ];
  const right = [
    {
      requires: [
        { module: "redux-actions", variables: ["handleActions"] },
        { module: "immutability-helper", variables: "update" }
      ]
    },
    { reducers: [{ key: "GET_GITHUB_ISSUES", value: "getGithubIssues" }] },
    { exports: ["actions"] }
  ];
  const expectedCode = `
const { handleActions } = require("redux-actions");
const update = require("immutability-helper");

const getGithubIssues = (state, {
  payload,
  error
}) => !error && update(state, {
  issues: {
    $set: payload
  }
});

const defaultState = {};

const actions = handleActions({
  GET_GITHUB_ISSUES: getGithubIssues
}, defaultState);

module.exports = actions;`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});
