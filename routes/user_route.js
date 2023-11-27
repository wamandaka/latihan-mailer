const express = require("express");
const router = express.Router();
const { updateProfilPicture } = require("../controllers/user_controller");

const multer = require("multer")();
router.post("/update-image", multer.single("image"), updateProfilPicture);

module.exports = router;
