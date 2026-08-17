const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../utils/email");

const generateToken = (id, role, email) => jwt.sign({ id, role, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || password.length < 6) {
      return res.status(400).json({ message: "Name, valid email and a password of at least 6 characters are required." });
    }

    const existing = await User.findOne({ email });
    if (existing?.isVerified) return res.status(400).json({ message: "User already exists" });

    if (existing) {
      await User.deleteOne({ _id: existing._id });
      await OTP.deleteMany({ email, action: "account_verification" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: "user", isVerified: false });
    const otp = generateOtp();

    await OTP.create({ email, otp, action: "account_verification" });
    try {
      await sendOtpEmail(email, otp, "account_verification");
    } catch (emailError) {
      await User.deleteOne({ _id: user._id });
      await OTP.deleteMany({ email, action: "account_verification" });
      return res.status(500).json({ message: "OTP email could not be sent. Please try again." });
    }

    return res.status(202).json({ message: "User registered successfully. Please check your email for OTP verification.", email });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    if (!user.isVerified && user.role === "user") {
      const otp = generateOtp();
      await OTP.deleteMany({ email, action: "account_verification" });
      await OTP.create({ email, otp, action: "account_verification" });
      await sendOtpEmail(email, otp, "account_verification");
      return res.status(400).json({ error: "Account not verified. A new OTP has been sent to your email." });
    }

    return res.json({
      message: "Login successful",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role, user.email),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();
    const otpRecord = await OTP.findOne({ email, otp, action: "account_verification" });
    if (!otpRecord) return res.status(400).json({ error: "Invalid or expired OTP" });

    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    await OTP.deleteMany({ email, action: "account_verification" });
    return res.json({
      message: "Account verified successfully. You can log in.",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role, user.email),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
