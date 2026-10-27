// TEMPORARY utility: resets the password of the existing admin user.
// Run manually from the backend folder, then delete this file. It is not imported by server.js.
//
//   node resetAdminPassword.js              -> prompts for the new password (input hidden)
//   ADMIN_NEW_PASSWORD=... node resetAdminPassword.js   -> uses the environment variable
//   node resetAdminPassword.js --dry-run    -> performs every check but writes nothing
//
// The password is never printed, logged or stored in this file.
require("dotenv").config({ quiet: true });

const readline = require("readline");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");

const ADMIN_EMAIL = "ayush@gmail.com";
const MIN_LENGTH = 8; // same rule as registration
const SALT_ROUNDS = 12; // same cost factor as authController.registerUser
const dryRun = process.argv.includes("--dry-run");

// Reads a line from the terminal without echoing the characters.
const askHidden = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) rl.output.write(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });

const getNewPassword = async () => {
  if (process.env.ADMIN_NEW_PASSWORD) return process.env.ADMIN_NEW_PASSWORD;

  const first = await askHidden("New admin password: ");
  const second = await askHidden("Confirm new password: ");
  if (first !== second) throw new Error("Passwords do not match.");
  return first;
};

const run = async () => {
  const password = await getNewPassword();

  if (password.length < MIN_LENGTH) {
    throw new Error(`Password must be at least ${MIN_LENGTH} characters.`);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: ADMIN_EMAIL });
  if (!user) {
    throw new Error(`No user found with email ${ADMIN_EMAIL}. Nothing was changed.`);
  }
  if (user.role !== "admin") {
    throw new Error(`User ${ADMIN_EMAIL} has role "${user.role}", not "admin". Nothing was changed.`);
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  if (dryRun) {
    console.log("[dry run] User found, role is admin, password hashed. No changes written.");
    return;
  }

  // Update only the password field; no upsert, so no duplicate user can be created.
  const result = await User.updateOne(
    { _id: user._id },
    { $set: { password: hash } },
    { timestamps: false }
  );
  if (result.modifiedCount !== 1) {
    throw new Error("Password was not updated.");
  }

  // Confirm what was stored really verifies, and that the role is untouched.
  const saved = await User.findById(user._id).select("+password");
  const verifies = await bcrypt.compare(password, saved.password);
  if (!verifies) throw new Error("Verification failed after update.");

  console.log(`Password updated for ${saved.email} (role: ${saved.role}). Stored hash verifies.`);
};

run()
  .catch((error) => {
    console.error("Error:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
