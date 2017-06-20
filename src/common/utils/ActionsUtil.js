const { AppActionTypes } = require("../constants");

const getErrorOrBody = res =>
  res.response ? res.response.body : res.body || res.message;

const dispatchCreator = (dispatch, action, params) =>
  response => dispatch(action(getErrorOrBody(response), params));

const actionCreator = type =>
  (response, params) => {
    return {
      params,
      response,
      type
    };
  };

const defaultFailureAction = actionCreator(AppActionTypes.REQUEST_FAILURE);
const requestStartedAction = (params = {}) => ({
  ...params,
  type: AppActionTypes.REQUEST_STARTED
});
const dispatchDefaultSuccess = dispatch =>
  () => dispatch({ type: AppActionTypes.REQUEST_SUCCESS });

module.exports = {
  dispatchCreator,
  actionCreator,
  dispatchDefaultSuccess,
  defaultFailureAction,
  requestStartedAction
};
