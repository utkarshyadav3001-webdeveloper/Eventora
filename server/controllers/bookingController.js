const Booking = require("../models/booking");
const Event = require("../models/Event");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { sendOtpEmail, sendBookingEmail } = require("../utils/email");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const bookEvent = async (req, res) => res.status(410).json({ success: false, message: "Direct booking is disabled. Verify the booking OTP first." });

const sendBookingOTP = async (req, res) => {
  try {
    const otp = generateOtp();
    await OTP.deleteMany({ email: req.user.email, action: "event_booking" });
    await OTP.create({ email: req.user.email, otp, action: "event_booking" });
    await sendOtpEmail(req.user.email, otp, "event_booking");
    return res.json({ success: true, message: "OTP sent" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyBookingOTP = async (req, res) => {
  try {
    const eventId = String(req.body.eventId || "");
    const otp = String(req.body.otp || "").trim();
    const numberOfTickets = Number(req.body.numberOfTickets ?? 1);
    if (!eventId || !otp) return res.status(400).json({ success: false, message: "Event ID and OTP are required" });
    if (!Number.isInteger(numberOfTickets) || numberOfTickets < 1) return res.status(400).json({ success: false, message: "Number of tickets must be a positive whole number" });

    const otpRecord = await OTP.findOne({ email: req.user.email, otp, action: "event_booking" });
    if (!otpRecord) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: event._id, availableSeats: { $gte: numberOfTickets } },
      { $inc: { availableSeats: -numberOfTickets } },
      { new: true }
    );
    if (!updatedEvent) return res.status(400).json({ success: false, message: "Not enough seats available" });

    try {
      const booking = await Booking.create({
        userId: req.user._id,
        eventId: event._id,
        numberOfTickets,
        amount: Number(event.price || 0) * numberOfTickets,
        status: "pending",
        paymentStatus: "Pending",
      });
      await OTP.deleteMany({ email: req.user.email, action: "event_booking" });
      return res.status(200).json({ success: true, message: "Booking Successful", data: booking, availableSeats: updatedEvent.availableSeats });
    } catch (bookingError) {
      await Event.findByIdAndUpdate(event._id, { $inc: { availableSeats: numberOfTickets } });
      throw bookingError;
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).populate("eventId").populate("userId", "-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("eventId").populate("userId", "-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("eventId").populate("userId", "-password");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Access denied" });
    return res.status(200).json({ success: true, data: booking });
  } catch (error) { return res.status(400).json({ success: false, message: "Invalid booking ID" }); }
};

const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    const requestedPaymentStatus = String(req.body.paymentStatus || "Pending").toLowerCase();
    booking.paymentStatus = requestedPaymentStatus === "paid" ? "Paid" : "Pending";
    booking.status = "confirmed";
    await booking.save();
    const user = await User.findById(booking.userId);
    const event = await Event.findById(booking.eventId);
    if (user && event) await sendBookingEmail(user.email, user.name, event.title);
    return res.json({ success: true, message: "Booking confirmed successfully.", data: booking });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Access denied" });
    if (booking.status === "cancelled") return res.status(400).json({ success: false, message: "Booking already cancelled." });

    const event = await Event.findByIdAndUpdate(booking.eventId, { $inc: { availableSeats: booking.numberOfTickets } }, { new: true });
    booking.status = "cancelled";
    await booking.save();
    return res.status(200).json({ success: true, message: "Booking cancelled successfully.", availableSeats: event?.availableSeats, data: booking });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

module.exports = { bookEvent, sendBookingOTP, verifyBookingOTP, getMyBookings, getBookingById, getAllBookings, confirmBooking, cancelBooking };
