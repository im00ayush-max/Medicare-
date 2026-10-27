const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMyProfile,
 forgotPassword,

} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

//REGISTER 
router.post("/register", registerUser);

//LOGIN
router.post("/login", loginUser);

router.get("/me",protect, getMyProfile);

router.post("/forgot-password", forgotPassword);


module.exports = router; 