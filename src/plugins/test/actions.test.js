const { code2data, data2code } = require("../actions");
const { getDiffs } = require("../helpers");

test("code2data: test simple actions", () => {
  const code = `
    const actions = createActions({
      GET_CUSTOMER: getCustomer,
      AAA: {
        BBB: test
      }
    },"CCC");
  `;
  expect(code2data(code)).toEqual({
    actions: [
      { key: "getCustomer", value: "getCustomer" },
      { key: "aaa.bbb", value: "test" }
    ],
    identActions: ["CCC"]
  });
});

test("data2code: test action add", () => {
  const code = `
    const actions = createActions({});
  `;
  const left = [{ actions: [] }];
  const right = [{ actions: [{ key: "getUser", value: "getUser" }] }];
  const expectedCode = `
const actions = createActions({
  GET_USER: getUser
});`;
  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});
