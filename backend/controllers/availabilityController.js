
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const date = String(req.query.date || "").trim();

    // Responds with an empty slot list, a human message and a machine-readable reason,
    // and logs why, so "no slots" can always be traced to a cause.
    const respondEmpty = (reason, message, extra = {}) => {
      console.log(
        `[availability] doctor=${doctorId} date=${date} -> no slots (${reason})`
      );
      return res.status(200).json({
        success: true,
        date,
        availableSlots: [],
        reason,
        message,
        ...extra,
      });
    };

    // Validate date format and actual calendar date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Fix the date query parameter. Use YYYY-MM-DD",
        receivedDate: date,
      });
    }

    const [year, month, day] = date.split("-").map(Number);
    const selectedDate = new Date(Date.UTC(year, month - 1, day));

    if (
      selectedDate.getUTCFullYear() !== year ||
      selectedDate.getUTCMonth() !== month - 1 ||
      selectedDate.getUTCDate() !== day
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid calendar date. Use YYYY-MM-DD",
      });
    }

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    if (!/^[a-f\d]{24}$/i.test(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayName = dayNames[selectedDate.getUTCDay()];
    const availability = (doctor.availability || []).find(
      (item) => item.day?.toLowerCase() === dayName.toLowerCase()
    );

    const scheduledDays = (doctor.availability || []).map((item) => item.day);

    if (scheduledDays.length === 0) {
      return respondEmpty(
        "NO_SCHEDULE_CONFIGURED",
        "This doctor has not set a weekly schedule yet. An admin can add one from Manage Doctors.",
        { day: dayName, scheduledDays }
      );
    }

    if (!availability) {
      return respondEmpty(
        "NOT_WORKING_THIS_DAY",
        `Doctor is not available on ${dayName}s.`,
        { day: dayName, scheduledDays }
      );
    }

    const startTime = availability.startTime;
    const endTime = availability.endTime;
    const slotDuration = Number(availability.slotDuration || 30);

    if (!startTime || !endTime || !(slotDuration > 0)) {
      return respondEmpty(
        "SCHEDULE_INCOMPLETE",
        "Doctor availability schedule is incomplete",
        { day: dayName, scheduledDays }
      );
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (
      !Number.isFinite(startMinutes) ||
      !Number.isFinite(endMinutes) ||
      startMinutes >= endMinutes
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor availability time",
      });
    }

    const dayStart = new Date(
      Date.UTC(year, month - 1, day, 0, 0, 0)
    );
    const nextDayStart = new Date(
      Date.UTC(year, month - 1, day + 1, 0, 0, 0)
    );

    const appointments = await Appointment.find({
      doctorId,
      appointmentTime: {
        $gte: dayStart,
        $lt: nextDayStart,
      },
      status: { $nin: ["cancelled", "canceled"] },
    }).select("appointmentTime");

    const bookedTimes = new Set(
      appointments.map((appointment) =>
        new Date(appointment.appointmentTime).toISOString()
      )
    );

    const availableSlots = [];

    for (
      let minutes = startMinutes;
      minutes + slotDuration <= endMinutes;
      minutes += slotDuration
    ) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;

      const slotDate = new Date(
        Date.UTC(year, month - 1, day, hour, minute)
      );

      if (slotDate <= new Date()) continue;

      const isoTime = slotDate.toISOString();

      availableSlots.push({
        time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        dateTime: isoTime,
        available: !bookedTimes.has(isoTime),
      });
    }

    if (availableSlots.length === 0) {
      return respondEmpty(
        "ALL_SLOTS_IN_PAST",
        "No upcoming slots remain on this date. Please choose a later date.",
        { day: dayName, scheduledDays }
      );
    }

    return res.status(200).json({
      success: true,
      date,
      day: dayName,
      availableSlots,
    });
  } catch (error) {
    console.error("Get available slots error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getAvailableSlots };

