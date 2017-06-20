const webapi = module.exports = require('express').Router();
const {json2faker, fakers} = require('../json2faker');

webapi.get('/fakers', (req, res, next) => {
  res.send(fakers);
})

webapi.post('/json2faker', (req, res, next) => {
  res.header("Content-Type", "text/plain");
  try {
    res.send(json2faker(req.body));
  } catch(ex) {
    res.status(500).send(ex);
    next()
  }
});
