// ONE-TIME utility: creates a new admin user. Run manually from the backend folder, then delete this file.
// It is not imported by server.js and exposes no API route.
//
//   node createAdmin.js             -> prompts for name, email and password (password input hidden)
//   node createAdmin.js --dry-run   -> performs every check but creates nothing
//
// Optional non-interactive use: ADMIN_NAME, ADMIN_EMAIL and ADMIN_NEW_PASSWORD environment variables.
// If the email already exists, nothing is changed (role and password are left untouched).
require("dotenv").config({ quiet: true });

const readline = require("readline");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");

const MIN_LENGTH = 8; // same rule as registration
const SALT_ROUNDS = 12; // same cost factor as authController.registerUser
const dryRun = process.argv.includes("--dry-run");

const ask = (question, { hidden = false } = {}) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Do not echo typed characters.
      rl._writeToOutput = (text) => {
        if (text.includes(question)) rl.output.write(text);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const run = async () => {
  const name = (process.env.ADMIN_NAME || (await ask("Admin name [Admin]: ")) || "Admin").trim();
  const email = (process.env.ADMIN_EMAIL || (await ask("Admin email: "))).trim().toLowerCase();

  if (!isValidEmail(email)) throw new Error("Please enter a valid email address.");

  let password = process.env.ADMIN_NEW_PASSWORD;
  if (!password) {
    password = await ask("Admin password: ", { hidden: true });
    const confirm = await ask("Confirm password: ", { hidden: true });
    if (password !== confirm) throw new Error("Passwords do not match.");
  }
  if (password.length < MIN_LENGTH) {
    throw new Error(`Password must be at least ${MIN_LENGTH} characters.`);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`A user with email ${email} already exists (role: ${existing.role}). Nothing was changed.`);
    process.exitCode = 1;
    return;
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  if (dryRun) {
    console.log(`[dry run] ${email} does not exist yet and would be created as admin. Nothing written.`);
    return;
  }

  try {
    const user = await User.create({ name, email, password: hash, role: "admin" });
    const saved = await User.findById(user._id).select("+password");
    const verifies = await bcrypt.compare(password, saved.password);
    if (!verifies) throw new Error("Stored password failed verification.");
    console.log(`Admin created: ${saved.email} (role: ${saved.role}). Stored hash verifies.`);
  } catch (error) {
    if (error.code === 11000) {
      console.log(`A user with email ${email} already exists. Nothing was changed.`);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
};

run()
  .catch((error) => {
    console.error("Error:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
