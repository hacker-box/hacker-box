process.env.NODE_ENV = "production";
process.env.BABEL_DISABLE_CACHE = 1;

var config = require("config");
var APP_SERVER_PORT = process.env.PORT || config.get("server.port");

require("./run")(APP_SERVER_PORT);
