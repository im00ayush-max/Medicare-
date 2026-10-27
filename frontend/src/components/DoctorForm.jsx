import { useState } from "react";
import { isValidEmail } from "../utils/format";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const emptyForm = {
  name: "",
  email: "",
  specialization: "",
  experience: "",
  qualification: "",
  consultationFee: "",
};

const toFormState = (doctor) =>
  doctor
    ? {
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        experience: String(doctor.experience),
        qualification: doctor.qualification,
        consultationFee: String(doctor.consultationFee),
      }
    : emptyForm;

const toScheduleState = (doctor) =>
  (doctor?.availability || []).map((a) => ({
    day: a.day,
    startTime: a.startTime,
    endTime: a.endTime,
    slotDuration: String(a.slotDuration || 30),
  }));

// Shared add/edit form. `onSubmit` receives { details, availability }.
export default function DoctorForm({ doctor, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => toFormState(doctor));
  const [schedule, setSchedule] = useState(() => toScheduleState(doctor));
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const addRow = () => {
    const used = schedule.map((s) => s.day);
    const day = DAYS.find((d) => !used.includes(d));
    if (!day) return;
    setSchedule([...schedule, { day, startTime: "09:00", endTime: "17:00", slotDuration: "30" }]);
  };

  const updateRow = (index, field, value) => {
    setSchedule(schedule.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    setErrors({ ...errors, schedule: "" });
  };

  // Demo helper: only fills the form. Nothing is saved until the admin clicks Save.
  const fillDemoSchedule = () => {
    setSchedule(
      DAYS.slice(0, 5).map((day) => ({
        day,
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: "30",
      }))
    );
    setErrors({ ...errors, schedule: "" });
  };

  const removeRow = (index) => setSchedule(schedule.filter((_, i) => i !== index));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!isValidEmail(form.email.trim())) next.email = "Enter a valid email";
    if (!form.specialization.trim()) next.specialization = "Specialization is required";
    if (form.experience === "" || Number(form.experience) < 0 || Number.isNaN(Number(form.experience)))
      next.experience = "Enter experience in years (0 or more)";
    if (!form.qualification.trim()) next.qualification = "Qualification is required";
    if (form.consultationFee === "" || Number(form.consultationFee) < 0 || Number.isNaN(Number(form.consultationFee)))
      next.consultationFee = "Enter a fee (0 or more)";

    for (const row of schedule) {
      if (!row.startTime || !row.endTime || row.startTime >= row.endTime) {
        next.schedule = `${row.day}: end time must be after start time`;
        break;
      }
      if (!(Number(row.slotDuration) > 0)) {
        next.schedule = `${row.day}: slot length must be greater than 0`;
        break;
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      details: {
        name: form.name.trim(),
        email: form.email.trim(),
        specialization: form.specialization.trim(),
        experience: Number(form.experience),
        qualification: form.qualification.trim(),
        consultationFee: Number(form.consultationFee),
      },
      availability: schedule.map((row) => ({
        day: row.day,
        startTime: row.startTime,
        endTime: row.endTime,
        slotDuration: Number(row.slotDuration),
      })),
    });
  };

  const field = (name, label, props = {}) => (
    <div className="form-group">
      <label htmlFor={`doc-${name}`}>{label}</label>
      <input id={`doc-${name}`} name={name} value={form[name]} onChange={handleChange} {...props} />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <form className="panel doctor-form" onSubmit={handleSubmit} noValidate>
      <h2>{doctor ? `Edit ${doctor.name}` : "Add New Doctor"}</h2>

      <div className="form-grid">
        {field("name", "Full name", { placeholder: "Dr. Jane Smith" })}
        {field("email", "Email", { type: "email", placeholder: "doctor@example.com" })}
        {field("specialization", "Specialization", { placeholder: "Cardiology" })}
        {field("qualification", "Qualification", { placeholder: "MBBS, MD" })}
        {field("experience", "Experience (years)", { type: "number", min: 0 })}
        {field("consultationFee", "Consultation fee (INR)", { type: "number", min: 0 })}
      </div>

      <h3>Weekly schedule</h3>
      <p className="muted small">
        Patients can only book on days that have a schedule. Times are treated as UTC by the backend.
      </p>

      {schedule.length === 0 && <p className="muted">No schedule set.</p>}

      {schedule.map((row, index) => (
        <div className="schedule-row" key={row.day}>
          <select
            value={row.day}
            onChange={(e) => updateRow(index, "day", e.target.value)}
            aria-label="Day"
          >
            {DAYS.filter((d) => d === row.day || !schedule.some((s) => s.day === d)).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={row.startTime}
            onChange={(e) => updateRow(index, "startTime", e.target.value)}
            aria-label="Start time"
          />
          <input
            type="time"
            value={row.endTime}
            onChange={(e) => updateRow(index, "endTime", e.target.value)}
            aria-label="End time"
          />
          <input
            type="number"
            min={5}
            step={5}
            value={row.slotDuration}
            onChange={(e) => updateRow(index, "slotDuration", e.target.value)}
            aria-label="Slot length in minutes"
            title="Slot length (minutes)"
          />
          <button type="button" className="btn btn-danger btn-sm" onClick={() => removeRow(index)}>
            Remove
          </button>
        </div>
      ))}
      {errors.schedule && <span className="field-error">{errors.schedule}</span>}

      <div className="form-actions-inline">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={addRow}
          disabled={schedule.length >= DAYS.length}
        >
          + Add day
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={fillDemoSchedule}
          title="Replaces the rows above with Mon-Fri, 09:00-17:00, 30-minute slots. Click Save to apply."
        >
          Fill demo schedule (Mon-Fri, 9-5)
        </button>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : doctor ? "Save Changes" : "Add Doctor"}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
