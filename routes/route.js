const express = require("express");
const router = express.Router();
const morgan = require("morgan");
const auth = require("./auth_route");
const userRoute = require("./user_route");

router.use(morgan("dev"));
router.use("/auth", auth);
router.use("/user", userRoute)
module.exports = router;
