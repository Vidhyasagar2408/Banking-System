const express = require("express");
const authControls = require("../controls/auth.controls");

const router = express.Router();

router.post("/register", authControls.registerUser);
router.post("/login", authControls.loginUser);
router.post("/logout", authControls.logoutUser);

module.exports = router;
