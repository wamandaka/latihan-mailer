const express = require("express");
const router = express.Router();
const { updateProfilPicture } = require("../controllers/user_controller");
const { Auth } = require("../middlewares/jwt");

const multer = require("multer")();
router.post("/update-image", multer.single("image"), Auth, updateProfilPicture);

module.exports = router;
