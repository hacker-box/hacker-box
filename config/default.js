const pkg = require("../package.json");
const messages = require("./messages.json");
// ports.
const DEV_SERVER_PORT = 3000;
const APP_SERVER_PORT = 7101;

const cspSelf = `'self'`;
const isProduction = process.env.NODE_ENV === "production";

const contentSecurityPolicy = {
  defaultSrc: [cspSelf],

  scriptSrc: [
    cspSelf,
    "https://*.firebaseio.com",
    "https://platform.twitter.com/"
  ]
    .concat(!isProduction && `http://localhost:${DEV_SERVER_PORT}`)
    .concat(!isProduction && "'unsafe-eval'")
    .filter(Boolean),

  connectSrc: [cspSelf, "https://*.googleapis.com", "wss://*.firebaseio.com"]
    .concat(!isProduction && `http://localhost:${DEV_SERVER_PORT}`)
    .concat(!isProduction && `ws://localhost:${DEV_SERVER_PORT}`)
    .filter(Boolean),

  frameSrc: [
    cspSelf,
    "http://localhost:*",
    "https://*.firebaseio.com",
    "http://platform.twitter.com"
  ],

  styleSrc: [
    cspSelf,
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://cdnjs.cloudflare.com/"
  ]
    .concat(!isProduction && "blob:")
    .concat(!isProduction && `http://localhost:${DEV_SERVER_PORT}`)
    .filter(Boolean),

  fontSrc: [cspSelf, "https://fonts.gstatic.com/"]
    .concat(!isProduction && `http://localhost:${DEV_SERVER_PORT}`)
    .filter(Boolean),

  mediaSrc: [cspSelf],

  imgSrc: [cspSelf, "*.amazonaws.com", "https://*.twitter.com/"]
    .concat(!isProduction && `http://localhost:${DEV_SERVER_PORT}`)
    .filter(Boolean)
};

const server = {
  name: pkg.name,
  version: pkg.version,
  port: APP_SERVER_PORT
};

const devServer = {
  name: pkg.name,
  version: pkg.version,
  port: DEV_SERVER_PORT
};

const firebase = {
  config: {
    apiKey: "AIzaSyAn_heWvfa920SNfmJpqAV9ZJDSHCARtlI",
    authDomain: "hacker-box.firebaseapp.com",
    databaseURL: "https://hacker-box.firebaseio.com",
    storageBucket: "hacker-box.appspot.com",
    messagingSenderId: "625217304650"
  },
  admin: {
    accountKey: ".firebase/serviceAccountKey.json",
    tokenETA: 600000
  }
};

const fonts = [
  "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism-coy.min.css"
];

const prettierConfig = {
  printWidth: 80
};

module.exports = {
  contentSecurityPolicy,
  server,
  devServer,
  messages,
  firebase,
  fonts,
  prettierConfig
};
