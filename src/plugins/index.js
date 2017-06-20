const requireModule = require("./requireModule");
const moduleExports = require("./moduleExports");
const webapi = require("./webapi");
const actions = require("./actions");
const selectors = require("./selectors");
const components = require("./components");
const reducers = require("./reducers");
const faker = require("./faker");
const { registerVisitors } = require("./plugin");
const indexCreator = require("./indexFile");

registerVisitors("webapi", requireModule);
registerVisitors("webapi", webapi);
registerVisitors("webapi", moduleExports);

registerVisitors("webapiIndex", requireModule);
registerVisitors("webapiIndex", indexCreator("webapis", "webapi"));
registerVisitors("webapiIndex", moduleExports);

registerVisitors("actions", requireModule);
registerVisitors("actions", actions);
registerVisitors("actions", moduleExports);

registerVisitors("actionsIndex", requireModule);
registerVisitors("actionsIndex", indexCreator("actions", "actions"));
registerVisitors("actionsIndex", moduleExports);

registerVisitors("reducers", requireModule);
registerVisitors("reducers", reducers);
registerVisitors("reducers", moduleExports);

registerVisitors("reducersIndex", requireModule);
registerVisitors("reducersIndex", indexCreator("reducers", "reducers"));
registerVisitors("reducersIndex", moduleExports);

registerVisitors("selectors", requireModule);
registerVisitors("selectors", selectors);
registerVisitors("selectors", moduleExports);

registerVisitors("components", requireModule);
registerVisitors("components", components);
registerVisitors("components", moduleExports);

registerVisitors("faker", requireModule);
registerVisitors("faker", faker);
registerVisitors("faker", moduleExports);
