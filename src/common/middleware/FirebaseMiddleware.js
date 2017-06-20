import { isFSA } from "flux-standard-action";

function isFirebase(action) {
  return action.meta &&
    action.meta.isFirebase &&
    typeof action.payload === "function";
}

function firebaseMiddleware(fireRef) {
  return ({ dispatch }) => {
    return next =>
      action => {
        if (!isFSA(action) || !isFirebase(action)) {
          return next(action);
        }

        return action.payload(fireRef).then(
          result => dispatch({ ...action, payload: result }),
          error => {
            dispatch({ ...action, payload: error, error: true });
            return Promise.reject(error);
          }
        );
      };
  };
}

module.exports = firebaseMiddleware;
