const request = require("superagent");

const getCodeForJSON = ({ jsonObj }) =>
  request
    .post("/api/webapi/json2faker")
    .type("json")
    .accept("text")
    .send(jsonObj);

const getFakers = () =>
  request.get("/api/webapi/fakers").type("json").accept("json");

const triggerAction = code =>
  request.post("/api/actions/trigger").type("json").accept("json").send(code);

const getUserToken = () =>
  request.post("/api/users/token").type("json").accept("json");

const getPasswordPin = token =>
  request
    .post("/api/users/passcode")
    .type("json")
    .accept("json")
    .send({ token });

const getCodeBlocks = (codeType, code) =>
  request
    .post(`/api/slate/blocks/${codeType}`)
    .type("json")
    .accept("json")
    .send({ code });

const getPrettierCode = code =>
  request
    .post("/api/transform/prettier")
    .type("text/plain")
    .accept("text/plain")
    .send(code);

module.exports = {
  getCodeForJSON,
  getFakers,
  triggerAction,
  getUserToken,
  getPasswordPin,
  getCodeBlocks,
  getPrettierCode
};
