const { filter } = require("fuzzaldrin");
const fakerDefs = require("../fakerDefs");

test("Expect fuzz filter to work", () => {
  const match = filter(fakerDefs, "url", {
    key: "keyword",
    maxResults: 1
  });
  expect(match).toEqual([{ keyword: "url", fakerFn: "internet.url" }]);
});
