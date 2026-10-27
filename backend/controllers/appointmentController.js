const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const mongoose = require("mongoose");

// Get authenticated user's ID
const getUserId = (req) => {
return req.user?.userId || req.user?.id || req.user?._id;
};

// ==========================================
// 1. BOOK APPOINTMENT
// ==========================================
const bookAppointment = async (req, res) => {
try {
const patientId = getUserId(req);
const { doctorId, date, reason } = req.body;

if (!patientId) {
  return res.status(401).json({
    success: false,
    message: "Please login first"
  });
}

if (!doctorId || !date || !reason) {
  return res.status(400).json({
    success: false,
    message: "doctorId, date and reason are required"
  });
}

if (!mongoose.Types.ObjectId.isValid(doctorId)) {
  return res.status(400).json({
    success: false,
    message: "Invalid doctor ID"
  });
}

const doctor = await Doctor.findById(doctorId);

if (!doctor) {
  return res.status(404).json({
    success: false,
    message: "Doctor not found"
  });
}

const appointment = await Appointment.create({
  patientId,
  doctorId,
  appointmentTime: date,
  reason,
  status: "pending"
});

const result = await Appointment.findById(appointment._id)
  .populate("doctorId", "name specialization consultationFee");

return res.status(201).json({
  success: true,
  message: "Appointment booked successfully",
  appointment: result
});

} catch (error) {
console.error("BOOK APPOINTMENT ERROR:", error);

return res.status(500).json({
  success: false,
  message: error.message
});

}
};

// ==========================================
// 2. GET MY APPOINTMENTS
// Logged-in patient sees their own appointments
// ==========================================
const getPatientAppointments = async (req, res) => {
try {
const patientId = getUserId(req);

if (!patientId) {
  return res.status(401).json({
    success: false,
    message: "User ID not found"
  });
}

const appointments = await Appointment.find({
  patientId
})
  .populate("doctorId", "name specialization consultationFee")
  .sort({ createdAt: -1 });

return res.status(200).json({
  success: true,
  count: appointments.length,
  appointments
});

} catch (error) {
console.error("GET MY APPOINTMENTS ERROR:", error);

return res.status(500).json({
  success: false,
  message: error.message
});

}
};

// ==========================================
// 3. GET APPOINTMENTS BY PATIENT ID
// Admin only - middleware is applied in routes
// ==========================================
const getMyAppointments = async (req, res) => {
try {
const { patientId } = req.params;

if (!mongoose.Types.ObjectId.isValid(patientId)) {
  return res.status(400).json({
    success: false,
    message: "Invalid patient ID"
  });
}

const appointments = await Appointment.find({
  patientId
})
  .populate("patientId", "name email")
  .populate("doctorId", "name specialization consultationFee")
  .sort({ createdAt: -1 });

return res.status(200).json({
  success: true,
  count: appointments.length,
  appointments
});

} catch (error) {
console.error("GET APPOINTMENTS BY PATIENT ERROR:", error);

return res.status(500).json({
  success: false,
  message: error.message
});

}
};

// ==========================================
// 4. GET ALL APPOINTMENTS
// Admin only - middleware is applied in routes
// ==========================================
const getAllAppointments = async (req, res) => {
try {
const appointments = await Appointment.find()
.populate("patientId", "name email")
.populate("doctorId", "name specialization consultationFee")
.sort({ createdAt: -1 });

return res.status(200).json({
  success: true,
  count: appointments.length,
  appointments
});

} catch (error) {
console.error("GET ALL APPOINTMENTS ERROR:", error);

return res.status(500).json({
  success: false,
  message: error.message
});

}
};

// ==========================================
// 5. CANCEL MY APPOINTMENT
// ==========================================
const cancelAppointment = async (req, res) => {
try {
const patientId = getUserId(req);
const { appointmentId } = req.params;

if (!patientId) {
  return res.status(401).json({
    success: false,
    message: "Please login first"
  });
}

if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
  return res.status(400).json({
    success: false,
    message: "Invalid appointment ID"
  });
}

const appointment = await Appointment.findById(appointmentId);

if (!appointment) {
  return res.status(404).json({
    success: false,
    message: "Appointment not found"
  });
}

if (String(appointment.patientId) !== String(patientId)) {
  return res.status(403).json({
    success: false,
    message: "You cannot cancel another patient's appointment"
  });
}

if (appointment.status === "cancelled") {
  return res.status(400).json({
    success: false,
    message: "Appointment is already cancelled"
  });
}

appointment.status = "cancelled";
await appointment.save();

return res.status(200).json({
  success: true,
  message: "Appointment cancelled successfully",
  appointment
});

} catch (error) {
console.error("CANCEL APPOINTMENT ERROR:", error);

return res.status(500).json({
  success: false,
  message: error.message
});

}
};

// ==========================================
// 6. UPDATE APPOINTMENT STATUS
// Admin only - middleware is applied in routes
// ==========================================
const updateAppointmentStatus = async (req, res) => {
try {
const { appointmentId } = req.params;
const { status } = req.body;

if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
  return res.status(400).json({
    success: false,
    message: "Invalid appointment ID"
  });
}

const allowedStatuses = ["pending", "confirmed", "cancelled"];

if (!allowedStatuses.includes(status)) {
  return res.status(400).json({
    success: false,
    message: "Status must be pending, confirmed, or cancelled"
  });
}

// Update only the status field. A full document save() would re-validate every
// required field, which fails for records that do not have them.
const appointment = await Appointment.findByIdAndUpdate(
  appointmentId,
  { $set: { status } },
  { new: true, runValidators: true }
);

if (!appointment) {
  return res.status(404).json({
    success: false,
    message: "Appointment not found"
  });
}

return res.status(200).json({
  success: true,
  message: "Appointment status updated successfully",
  appointment
});

} catch (error) {
console.error("UPDATE APPOINTMENT STATUS ERROR:", error);

return res.status(500).json({
  success: false,
  message: error.message
});

}
};

// ==========================================
// EXPORT ALL FUNCTIONS
// ==========================================
module.exports = {
bookAppointment,
getPatientAppointments,
getMyAppointments,
getAllAppointments,
cancelAppointment,
updateAppointmentStatus
};
