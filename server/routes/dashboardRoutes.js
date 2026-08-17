const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

router.get("/dashboard", protect, (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to Dashboard", user: req.user });
});

module.exports = router;
