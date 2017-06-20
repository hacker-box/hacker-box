const app = module.exports = require('express').Router();
const config = require('config');

app.get('/messages/:locale?',(req, res, next) => {
  const messages = config.get('messages') || {};
  const locale = req.params;
  const localMessages = locale && messages[locale] ? messages[locale] : messages['en_US']
  return res.send(localMessages);
});
