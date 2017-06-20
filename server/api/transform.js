const transform = (module.exports = require("express").Router());
const prettier = require("prettier");

transform.post("/prettier", (req, res, next) => {
  res.header("Content-Type", "text/plain");
  try {
    res.status(200).send(prettier.format(req.body));
  } catch (ex) {
    console.error(ex);
    res.status(500).send(ex);
    next();
  }
});
