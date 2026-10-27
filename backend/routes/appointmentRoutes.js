const express = require("express");
const router = express.Router();

const {
bookAppointment,
getPatientAppointments,
getMyAppointments,
getAllAppointments,
cancelAppointment,
updateAppointmentStatus
} = require("../controllers/appointmentController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, bookAppointment);
router.get("/my-appointments", protect, getPatientAppointments);
router.get("/", protect, authorizeRoles("admin"), getAllAppointments);
router.get("/patient/:patientId", protect, authorizeRoles("admin"), getMyAppointments);
router.patch("/:appointmentId/status", protect, authorizeRoles("admin"), updateAppointmentStatus);
router.patch("/:appointmentId/cancel", protect, cancelAppointment);

module.exports = router;
