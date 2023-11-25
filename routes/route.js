const express = require("express");
const router = express.Router();
const morgan = require("morgan");
const auth = require("./auth_route");

router.use(morgan("morgan"));
router.use("/auth", auth);
module.exports = router;
