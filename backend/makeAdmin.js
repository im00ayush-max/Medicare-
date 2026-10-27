require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

const makeAdmin = async () => {
  try {
    // MongoDB connection
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    // Apna registered email yahan likho
    const email = "ayush@gmail.com";

    // User ka role admin karo
    const user = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (!user) {
      console.log("User not found. Please check your registered email.");
      return;
    }

    console.log("Admin role assigned successfully!");
    console.log("Email:", user.email);
    console.log("Role:", user.role);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

makeAdmin();