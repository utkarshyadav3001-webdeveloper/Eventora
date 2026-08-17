const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
  sendBookingOTP,
  getMyBookings,
  getBookingById,
  confirmBooking,
  cancelBooking,
  verifyBookingOTP,
  getAllBookings,
} = require("../controllers/bookingController");

router.get("/", protect, admin, getAllBookings);
router.post("/send-otp", protect, sendBookingOTP);
router.post("/verify", protect, verifyBookingOTP);
router.get("/my", protect, getMyBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id/confirm", protect, admin, confirmBooking);
router.delete("/:id", protect, cancelBooking);

module.exports = router;
