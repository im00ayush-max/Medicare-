const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const toSafeUser = require("../utils/safeUser");

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "patient"
    }); 

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    return res.status(500).json({
      message: "Registration failed"
    });
  }
};

 
// LOGIN USER
const loginUser = async (req, res) => {  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }
 
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed"
    });
  }
};



const getMyProfile = async(req,res) => {
  try{
    const user = await User.findById(req.user.userId);

    if(!user) {
      return res.status(404).json ({
        success:false,
        message :"User not found"
      });
    }


  return res.status(200).json({
success: true,
user: toSafeUser(user)
  });
} catch (error) {
  console.error("GET ME ERROR:", error.message);
  return res.status(500).json({
    success:false,
    message:"failed to fetch profile"
  });
}
};


// FORGOT PASSWORD - Send OTP
const forgotPassword = async (req, res) => {
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

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.resetPasswordOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetPasswordOTPExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await user.save();

    try {
      await sendEmail(
        normalizedEmail,
        "MediCare Password Reset OTP",
        `Your password reset OTP is ${otp}. It expires in 5 minutes. Do not share it with anyone.`
      );
    } catch (emailError) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save();

      console.error("PASSWORD RESET EMAIL ERROR:", emailError.message);

      return res.status(500).json({
        success: false,
        message: "Email could not be sent."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully."
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



module.exports = {
  registerUser,
  loginUser,
  getMyProfile,
  forgotPassword,
  
};