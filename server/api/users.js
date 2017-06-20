const users = (module.exports = require("express").Router());
const fbadmin = require("firebase-admin");
const crypto = require("crypto");
const { tokenETA } = require("config").get("firebase").admin;

users.post("/token", (req, res, next) => {
  const adminRef = fbadmin.database().ref("admin");
  const { passcode /*, version */ } = req.body || {};

  /*
  if (version === "1.0.0") {
    res.status(500).send("Upgrade your cli");
    return next();
  }
  */

  const getToken = (userId, sendUserId) =>
    fbadmin
      .auth()
      .createCustomToken(userId)
      .then(token => res.send(sendUserId ? { token, userId } : { token }))
      .catch(err => {
        res.status(500).send(err);
        next();
      });

  if (passcode) {
    const passcodeRef = adminRef.child(`passcode/${passcode}`);
    const now = new Date().getTime();
    if (!passcodeRef) {
      res.status(400).send("Invalid passcode");
      return next();
    }
    passcodeRef.once("value").then(snap => {
      const { userId, createdAt } = snap.val() || {};
      if (!userId || !createdAt || createdAt + tokenETA < now) {
        res.status(498).send("Pin expired!");
        return next();
      }
      getToken(userId, true);
    });
    return;
  }

  // create new
  const userRef = adminRef.child("users").push();
  userRef.set(true).then(() => getToken(userRef.key));
});

// Return passcode for a given firebase token.
users.post("/passcode", (req, res, next) => {
  const { token } = req.body || {}; // token here is firebase token.
  if (!token) {
    res.status(499).send("Pin required!");
    return next();
  }
  const passcodeRef = fbadmin.database().ref("admin/passcode");
  fbadmin
    .auth()
    .verifyIdToken(token)
    .then(user => {
      const passcode = crypto.randomBytes(4).toString("hex").toUpperCase();
      const createdAt = new Date().getTime();

      passcodeRef
        .update({ [passcode]: { userId: user.uid, createdAt } })
        .then(() => res.send({ passcode }));
    })
    .catch(err => {
      res.status(500).send(err);
      next();
    });
});
