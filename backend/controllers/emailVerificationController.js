const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Send OTP to user's email
const sendOTP = async (req, res) => {
try {
const { email } = req.body;


if (!email) {
  return res.status(400).json({ 
    success: false,
    message: "Email is required"
  });
}

const normalizedEmail = email.trim().toLowerCase();

const user = await User.findOne({
  email: normalizedEmail
});

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found. Please register first."
  });
}

if (user.isEmailVerified) {
  return res.status(400).json({
    success: false,
    message: "Email is already verified"
  });
}

// Generate a 6-digit OTP
const otp = crypto.randomInt(100000, 1000000).toString();

// Save OTP as a hash, not as plain text
user.emailOTP = crypto
  .createHash("sha256")
  .update(otp)
  .digest("hex");

// OTP expires in 5 minutes
user.emailOTPExpires = new Date(Date.now() + 5 * 60 * 1000);

await user.save();

try {
  await sendEmail(
    normalizedEmail,
    "MediCare Email Verification OTP",
   `Your OTP is ${otp}. It expires in 5 minutes. Do not share it with anyone.`
  );
} catch (emailError) {
  user.emailOTP = undefined;
  user.emailOTPExpires = undefined;
  await user.save();

  console.error("EMAIL ERROR:", emailError.message);

  return res.status(500).json({
    success: false,
    message: "Email could not be sent. Check your email configuration."
  });
}

return res.status(200).json({
  success: true,
  message: "OTP sent successfully. Please check your email."
});


} catch (error) {
console.error("SEND OTP ERROR:", error);


return res.status(500).json({
  success: false,
  message: "Internal server error"
});


}
};

// Verify OTP
const verifyOTP = async (req, res) => {
try {
const { email, otp } = req.body;


if (!email || !otp) {
  return res.status(400).json({
    success: false,
    message: "Email and OTP are required"
  });
}

if (!/^\d{6}$/.test(String(otp))) {
  return res.status(400).json({
    success: false,
    message: "OTP must contain exactly 6 digits"
  });
}

const normalizedEmail = email.trim().toLowerCase();

const user = await User.findOne({
  email: normalizedEmail
});

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found"
  });
}

if (user.isEmailVerified) {
  return res.status(400).json({
    success: false,
    message: "Email is already verified"
  });
}

if (
  !user.emailOTP ||
  !user.emailOTPExpires ||
  new Date(user.emailOTPExpires).getTime() <= Date.now()
) {
  return res.status(400).json({
    success: false,
    message: "OTP is invalid or expired. Please request a new OTP."
  });
}

const submittedHash = crypto
  .createHash("sha256")
  .update(String(otp))
  .digest("hex");

const storedHash = Buffer.from(user.emailOTP, "hex");
const providedHash = Buffer.from(submittedHash, "hex");

if (
  storedHash.length !== providedHash.length ||
  !crypto.timingSafeEqual(storedHash, providedHash)
) {
  return res.status(400).json({
    success: false,
    message: "Incorrect OTP"
  });
}

// Mark email as verified and invalidate the OTP
user.isEmailVerified = true;
user.emailOTP = undefined;
user.emailOTPExpires = undefined;

await user.save();

return res.status(200).json({
  success: true,
  message: "Email verified successfully"
});


} catch (error) {
console.error("VERIFY OTP ERROR:", error);


return res.status(500).json({
  success: false,
  message: "Internal server error"
});


}
};

module.exports = {
sendOTP,
verifyOTP
};
