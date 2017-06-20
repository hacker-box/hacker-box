const _camelCase = require("lodash.camelcase");
const { createCodeBlock } = require("../../common/components/codeslate");

const verb = /^(get|post|del|delete|put|head|patch|fetch)/g;

function createReducerCode({ actionType, apiName }) {
  const apiFnName = apiName ? apiName : _camelCase(actionType);
  const storeKey = apiFnName.replace(verb, "");
  const lcStoreKey = storeKey.charAt(0).toLowerCase() + storeKey.substring(1);

  return `
const {handleAction} = require('redux-actions');

function receive${storeKey}(state, action) {
  return {
    ...state,
    ${lcStoreKey}: action.payload.body
  }
}

module.exports = handleAction('${actionType}', receive${storeKey}, {});
`;
}

const reducersFile = `
const { handleActions } = require("redux-actions");
const _get = require("lodash.get");
const update = require("immutability-helper");

const defaultState = {};

const reducers = handleActions({
}, defaultState);

module.exports = reducers;
`;

function getReducerCode({ action }) {
  const actionParts = action.split("_");
  actionParts.shift();
  const stateNode = _camelCase(actionParts.join("_"));
  actionParts.unshift("receive");
  const functionName = _camelCase(actionParts.join("_"));
  return `

const ${functionName} = (state, {payload}) => {
  return update(state, { ${stateNode}: { $set: payload } }) ;
}

const reducers = handleActions({
  ${action} : ${functionName}
}, defaultState)
`;
}

module.exports = {
  reducersFile,
  getReducerCode,
  createReducerCode: actionParts =>
    createCodeBlock(createReducerCode(actionParts))
};
