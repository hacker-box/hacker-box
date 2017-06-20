const api = (module.exports = require("express").Router());

api.use("/app", require("./app"));
api.use("/users", require("./users"));
api.use("/transform", require("./transform"));
