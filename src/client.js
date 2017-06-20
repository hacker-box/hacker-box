const { createStore, combineReducers, applyMiddleware } = require("redux");
const thunkMiddleware = require("redux-thunk").default;
const loggerMiddleware = require("redux-logger");
const React = require("react");
const ReactDOM = require("react-dom");
const { Provider } = require("react-redux");
const { loadJsonFromScript } = require("./common/utils/LoadingUtil");
const { setMessages } = require("./common/utils/MessageUtil");
const { UserActions } = require("./actions");
const createHistory = require("history/createBrowserHistory").default;
const promiseMiddleware = require("redux-promise");
const {
  initFirebase,
  firebaseMiddleware: createFirebasMiddleware
} = require("./common/firebase");

const {
  ConnectedRouter,
  routerReducer,
  routerMiddleware: createRouterMiddleware
} = require("react-router-redux");

require("./styles");

const AppMain = require("./containers/AppMain");
const reducers = require("./reducers");
const logger = loggerMiddleware({ logger: console });

// setup router
const history = createHistory();
const routerMiddleware = createRouterMiddleware(history);

// setup firebase
const firebasMiddleware = createFirebasMiddleware();

// init state
const initialState = {};

const reducer = combineReducers({
  ...reducers,
  router: routerReducer
});

const middlewares = [
  thunkMiddleware,
  routerMiddleware,
  firebasMiddleware,
  promiseMiddleware
];

if (process.env.NODE_ENV === "development") {
  middlewares.push(logger);
}
const finalCreateStore = applyMiddleware(...middlewares)(createStore);

const store = finalCreateStore(reducer, initialState);

initFirebase(store.dispatch).onAuthStateChanged(UserActions);

setMessages(loadJsonFromScript("messages-bundle"));

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <AppMain />
    </ConnectedRouter>
  </Provider>,
  document.getElementById("root")
);

// twitter
window.twttr = (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0], t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);

  t._e = [];
  t.ready = function(f) {
    t._e.push(f);
  };

  return t;
})(document, "script", "twitter-wjs");
