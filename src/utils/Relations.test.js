const { getRelationById, mergeRelation } = require("./Relations");

const relations = [
  [{ uid: "abc", type: "webapi", relationId: 0 }],
  [
    { uid: "xyz", type: "action", relationId: 1 },
    { uid: "def", type: "webapi", relationId: 1 }
  ]
];

test("test getRelationById", () => {
  expect(getRelationById(relations, "def")).toBe(1);
});

test("test mergeRelation", () => {
  expect(
    mergeRelation(relations, [
      { uid: "def", type: "webapi" },
      { uid: "123", type: "reducer" }
    ])
  ).toEqual([
    [{ uid: "abc", type: "webapi", relationId: 0 }],
    [
      { uid: "xyz", type: "action", relationId: 1 },
      { uid: "def", type: "webapi", relationId: 1 },
      { uid: "123", type: "reducer", relationId: 1 }
    ]
  ]);
});

test("test mergeRelation new", () => {
  expect(
    mergeRelation(relations, [
      { uid: "777", type: "webapi" },
      { uid: "888", type: "reducer" }
    ])
  ).toEqual([
    [{ uid: "abc", type: "webapi", relationId: 0 }],
    [
      { uid: "xyz", type: "action", relationId: 1 },
      { uid: "def", type: "webapi", relationId: 1 },
      { uid: "123", type: "reducer", relationId: 1 }
    ],
    [
      { uid: "777", type: "webapi", relationId: 2 },
      { uid: "888", type: "reducer", relationId: 2 }
    ]
  ]);
});
