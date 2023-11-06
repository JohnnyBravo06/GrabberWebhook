const express = require("express");
const router = express.Router();

const user = require("./user/index.js");
const client = require("./client/index.js");

router.use("/user", user);
router.use("/client", client);

module.exports = router;
