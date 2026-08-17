const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  connectionTimeout: 15000,
  socketTimeout: 15000,
});

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  await transporter.sendMail({
    from: `"Eventora" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Booking Confirmed - ${eventTitle}`,
    html: `<div style="font-family:Arial;padding:20px"><h2>Hello ${userName},</h2><p>Your booking for <b>${eventTitle}</b> has been confirmed successfully.</p><p>Thank you for choosing <b>Eventora</b>.</p></div>`,
  });
};

const sendOtpEmail = async (userEmail, otp, type) => {
  const isVerification = type === "account_verification";
  await transporter.sendMail({
    from: `"Eventora" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: isVerification ? "Verify Your Eventora Account" : "Event Booking OTP",
    html: `<div style="font-family:Arial;padding:20px;border:1px solid #ddd;border-radius:10px"><h2>Eventora OTP Verification</h2><p>${isVerification ? "Use this OTP to verify your account." : "Use this OTP to confirm your booking."}</p><h1 style="letter-spacing:8px;color:#2563eb;background:#f3f4f6;padding:15px;display:inline-block;border-radius:8px">${otp}</h1><p>OTP is valid for 5 minutes.</p><p>If you didn't request this OTP, ignore this email.</p></div>`,
  });
};

module.exports = { sendBookingEmail, sendOtpEmail };
