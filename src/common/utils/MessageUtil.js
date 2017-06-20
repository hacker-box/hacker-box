const formatMessage = require("format-message");

let messages = {};

function setMessages(m) {
  messages = m;
}

function getMessages() {
  return messages;
}

function getMessage(key, defaultMessage) {
  const message = messages[key];
  return message !== void 0
    ? message
    : defaultMessage !== void 0 ? defaultMessage : key;
}

function getFormatMessage(key, args, defaultMessage) {
  const message = messages[key];
  if (message) {
    return formatMessage(message, args);
  }
  return defaultMessage !== void 0 ? defaultMessage : key;
}

module.exports = {
  setMessages,
  getMessages,
  getMessage,
  getFormatMessage
};
