const { code2data, data2code } = require("../moduleExports");
const { getDiffs } = require("../helpers");

test("code2data: ident exports", () => {
  const code = `
module.exports = abc;
`;
  expect(code2data(code)).toEqual({ exports: ["abc"] });
});

test("code2data: object exports", () => {
  const code = `
module.exports = {
  AbcFunction,
  XyzFunction
};
`;
  expect(code2data(code)).toEqual({ exports: ["AbcFunction", "XyzFunction"] });
});

test("code2data: object exports with different key value", () => {
  const code = `
module.exports = {
  AbcFunction,
  MyFunction: _MyFunction
};
`;
  expect(code2data(code)).toEqual({
    exports: ["AbcFunction", { key: "MyFunction", value: "_MyFunction" }]
  });
});

test("code2data: simple exports", () => {
  const code = `
exports = zzz;
`;
  expect(code2data(code)).toEqual({ exports: ["zzz"] });
});

test("data2code: exports added", () => {
  const code = `
exports = zzz;
`;
  const left = [{ exports: ["zzz"] }];
  const right = [{ exports: ["zzz", "abc"] }];
  const expectedCode = `
exports = {
  zzz,
  abc
};`;

  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: exports first", () => {
  const code = `
exports = {};
`;
  const left = [{ exports: [] }];
  const right = [{ exports: ["zzz"] }];
  const expectedCode = `
exports = {
  zzz
};`;

  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: exports first to empty", () => {
  const code = "";
  const left = [{ exports: [] }];
  const right = [{ exports: ["zzz"] }];
  const expectedCode = `module.exports = zzz;`;

  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: exports added more", () => {
  const code = `
exports = {zzz,abc};
`;
  const left = [{ exports: ["zzz", "abc"] }];
  const right = [{ exports: ["zzz", "abc", "xyz"] }];
  const expectedCode = `
exports = { zzz, abc, xyz
};`;

  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: exports modified", () => {
  const code = `
exports = zzz;
`;
  const left = [{ exports: ["zzz"] }];
  const right = [{ exports: ["bbb"] }];
  const expectedCode = `
exports = bbb;`;

  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: object exports modified", () => {
  const code = `
exports = {aaa, bbb};
`;
  const left = [{ exports: ["aaa", "bbb"] }];
  const right = [{ exports: ["aaa", "ccc"] }];
  const expectedCode = `
exports = { aaa, ccc };`;

  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: object exports key, value modified", () => {
  const code = `
exports = {aaa: "ccc", bbb};
`;
  const left = [{ exports: [{ key: "aaa", value: "ccc" }, "bbb"] }];
  const right = [{ exports: [{ key: "aaa", value: "yyy" }, "bbb"] }];
  const expectedCode = `
exports = { aaa: yyy, bbb };`;

  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});

test("data2code: object exports deleted", () => {
  const code = `
exports = {aaa: "ccc", bbb};
`;
  const left = [{ exports: [{ key: "aaa", value: "ccc" }, "bbb"] }];
  const right = [{ exports: [{ key: "aaa", value: "yyy" }] }];
  const expectedCode = `
exports = { aaa: yyy };`;

  const diffs = getDiffs(left, right);
  expect(data2code(code, diffs)).toBe(expectedCode);
});
