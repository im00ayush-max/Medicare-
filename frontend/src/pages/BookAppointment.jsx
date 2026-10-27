import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { getAvailability, getDoctorById } from "../services/doctorService";
import { bookAppointment } from "../services/appointmentService";
import { getErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { formatDate, formatFee, todayString } from "../utils/format";

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState("");

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotMessage, setSlotMessage] = useState("");
  const [scheduledDays, setScheduledDays] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    let active = true;
    getDoctorById(doctorId)
      .then((data) => active && setDoctor(data.doctor))
      .catch((err) => active && setDoctorError(getErrorMessage(err, "Could not load doctor.")))
      .finally(() => active && setDoctorLoading(false));
    return () => {
      active = false;
    };
  }, [doctorId]);

  const loadSlots = async (selectedDate) => {
    setSlots([]);
    setSlotMessage("");
    setScheduledDays([]);
    setSlotsError("");
    setSelectedSlot(null);
    setBookingError("");
    if (!selectedDate) return;

    setSlotsLoading(true);
    try {
      const data = await getAvailability(doctorId, selectedDate);
      setSlots(data.availableSlots || []);
      setSlotMessage(data.message || "");
      setScheduledDays(data.scheduledDays || []);
    } catch (err) {
      setSlotsError(getErrorMessage(err, "Could not load available slots."));
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    loadSlots(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingError("");
    setReasonError("");

    if (!selectedSlot) {
      setBookingError("Please select an available time slot.");
      return;
    }
    if (!reason.trim()) {
      setReasonError("Please tell the doctor the reason for your visit.");
      return;
    }

    setSubmitting(true);
    try {
      await bookAppointment({
        doctorId,
        date: selectedSlot.dateTime,
        reason: reason.trim(),
      });
      toast.success("Appointment booked successfully!");
      navigate("/dashboard");
    } catch (err) {
      setBookingError(getErrorMessage(err, "Could not book the appointment."));
      // Refresh so a slot taken meanwhile shows as unavailable.
      loadSlots(date);
    } finally {
      setSubmitting(false);
    }
  };

  if (doctorLoading) return <div className="container page"><Loader text="Loading doctor..." /></div>;

  if (doctorError || !doctor) {
    return (
      <div className="container page">
        <div className="alert alert-error">{doctorError || "Doctor not found."}</div>
        <Link to="/doctors" className="btn btn-outline">
          Back to doctors
        </Link>
      </div>
    );
  }

  const openSlots = slots.filter((s) => s.available).length;

  return (
    <div className="container page">
      <Link to={`/doctors/${doctor._id}`} className="back-link">
        &larr; Back to doctor profile
      </Link>

      <div className="detail-layout">
        <form className="panel detail-main" onSubmit={handleSubmit} noValidate>
          <h1>Book an Appointment</h1>

          <div className="form-group">
            <label htmlFor="date">1. Select a date</label>
            <input
              id="date"
              type="date"
              min={todayString()}
              value={date}
              onChange={handleDateChange}
            />
          </div>

          <div className="form-group">
            <label>2. Select a time slot</label>
            {!date && <p className="muted">Pick a date to see available slots.</p>}
            {slotsLoading && <Loader text="Checking availability..." />}
            {slotsError && <div className="alert alert-error">{slotsError}</div>}

            {date && !slotsLoading && !slotsError && slots.length === 0 && (
              <div className="alert alert-info">
                {slotMessage || "No slots are available on this date. Try another day."}
                {scheduledDays.length > 0 && (
                  <div className="small">Working days: {scheduledDays.join(", ")}</div>
                )}
              </div>
            )}

            {slots.length > 0 && (
              <>
                <div className="slot-grid">
                  {slots.map((slot) => (
                    <button
                      key={slot.dateTime}
                      type="button"
                      className={`slot ${selectedSlot?.dateTime === slot.dateTime ? "selected" : ""}`}
                      disabled={!slot.available}
                      title={slot.available ? "Available" : "Already booked"}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
                <p className="muted small">
                  {openSlots} of {slots.length} slots open. Greyed-out slots are already booked.
                  Times follow the clinic schedule (UTC).
                </p>
              </>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reason">3. Reason for visit</label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError("");
              }}
              placeholder="Briefly describe your symptoms or the purpose of the visit"
            />
            {reasonError && <span className="field-error">{reasonError}</span>}
          </div>

          {bookingError && <div className="alert alert-error">{bookingError}</div>}

          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>

        <aside className="panel book-box">
          <h3>{doctor.name}</h3>
          <span className="chip">{doctor.specialization}</span>
          <ul className="doctor-meta">
            <li>{doctor.qualification}</li>
            <li>{doctor.experience} years experience</li>
            <li>
              Fee: <strong>{formatFee(doctor.consultationFee)}</strong>
            </li>
          </ul>
          {selectedSlot && (
            <div className="summary">
              <strong>Your selection</strong>
              <p>
                {formatDate(selectedSlot.dateTime)} at {selectedSlot.time}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
