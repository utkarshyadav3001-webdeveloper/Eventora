const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyOtp } = require("../controllers/authcontroller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-Otp", verifyOtp);

module.exports = router;
