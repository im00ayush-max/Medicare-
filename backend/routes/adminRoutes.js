const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getAdminDashboard,
} = require("../controllers/adminController");

router.get("/dashboard", adminMiddleware, getAdminDashboard);

module.exports = router;