
 require("dotenv").config();

 const doctorRoutes = require("./routes/doctorRoutes");
const express = require("express");
const cors = require("cors");
const appointmentRoutes = require("./routes/appointmentRoutes");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");
const emailVerificationRoutes = require("./routes/emailVerificationRoutes");
const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    message: "Welcome to MediCare Hospital API"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors",doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", emailVerificationRoutes);

const startServer = async () => {
  try {
    await connectDB(); 

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
};

startServer();