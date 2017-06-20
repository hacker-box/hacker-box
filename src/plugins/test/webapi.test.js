const { code2data, data2code } = require("../webapi");
const { getDiffs } = require("../helpers");

test("code2data: simple webapi to code", () => {
  const code = `
    const getUserInfo = () => request.get("/api/user").accept('json').type('json');
    const getCustomer = customerId => request.get(\`/api/customer/\${customerId}\`).accept('json').type('json');
    function getItems(itemIds) {
      return request.post("/api/items").send(itemId).type('json').accept('json');
    }
  `;
  expect(code2data(code)).toEqual({
    webapis: [
      { verb: "get", url: "/api/user", name: "getUserInfo" },
      { verb: "get", url: "/api/customer/${customerId}", name: "getCustomer" }, //eslint-disable-line
      { verb: "post", url: "/api/items", name: "getItems" }
    ]
  });
});

test("data2code: add webapi", () => {
  const code = `
const request = require("superagent");
  `;
  const left = [{ webapis: [] }];
  const right = [
    {
      webapis: [{ verb: "get", url: "/api/user", name: "getUserInfo" }]
    }
  ];
  const expectedCode = `
const request = require("superagent");

const getUserInfo = () => request.get("/api/user").accept("json").type("json").then(res => res.body);`;
  expect(data2code(code, getDiffs(left, right))).toBe(expectedCode);
});

test("data2code: add webapi", () => {
  const code = `
const request = require("superagent");

const getUserInfo = () => request.get("/api/user").accept("json").type("json").then(res => res.body);
  `;
  const left = [
    {
      webapis: [
        {
          verb: "get",
          url: "/api/user",
          name: "getUserInfo"
        }
      ]
    }
  ];
  const right = [
    {
      webapis: [
        {
          verb: "get",
          url: "/api/user",
          name: "getUserInfo"
        },
        { verb: "post", url: "/api/items", name: "getItems" }
      ]
    }
  ];
  const expectedCode = `
const request = require("superagent");

const getUserInfo = () => request.get("/api/user").accept("json").type("json").then(res => res.body);

const getItems = () => request.post("/api/items").accept("json").type("json").then(res => res.body);`;
  expect(data2code(code, getDiffs(left, right))).toBe(expectedCode);
});

test("data2code: webapi name modified", () => {
  const code = `
const getUserInfo = () => request.get("/api/user").accept("json").type("json").then(res => res.body);
  `;
  const left = [
    {
      webapis: [
        {
          verb: "get",
          url: "/api/user",
          name: "getUserInfo"
        }
      ]
    }
  ];
  const right = [
    {
      webapis: [
        {
          verb: "get",
          url: "/api/user",
          name: "getUser"
        }
      ]
    }
  ];
  const expectedCode = `
const getUser = () => request.get("/api/user").accept("json").type("json").then(res => res.body);`;
  expect(data2code(code, getDiffs(left, right))).toBe(expectedCode);
});

test("data2code: webapi verb modified", () => {
  const code = `
const getUserInfo = () => request.get("/api/user").accept("json").type("json").then(res => res.body);
  `;
  const left = [
    {
      webapis: [
        {
          verb: "get",
          url: "/api/user",
          name: "getUserInfo"
        }
      ]
    }
  ];
  const right = [
    {
      webapis: [
        {
          verb: "post",
          url: "/api/user",
          name: "getUserInfo"
        }
      ]
    }
  ];
  const expectedCode = `
const getUserInfo = () => request.post("/api/user").accept("json").type("json").then(res => res.body);`;
  expect(data2code(code, getDiffs(left, right))).toBe(expectedCode);
});

test("data2code: webapi name modified", () => {
  const code = `
const getUserInfo = () => request.get("/api/user").accept("json").type("json").then(res => res.body);
  `;
  const left = [
    {
      webapis: [
        {
          verb: "get",
          url: "/api/user",
          name: "getUserInfo"
        }
      ]
    }
  ];
  const right = [
    {
      webapis: [
        {
          verb: "get",
          url: "/REST/api/user",
          name: "getUserInfo"
        }
      ]
    }
  ];
  const expectedCode = `
const getUserInfo = () => request.get("/REST/api/user").accept("json").type("json").then(res => res.body);`;
  expect(data2code(code, getDiffs(left, right))).toBe(expectedCode);
});
