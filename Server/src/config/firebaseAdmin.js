// config/firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json"); // descargado desde Firebase console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
