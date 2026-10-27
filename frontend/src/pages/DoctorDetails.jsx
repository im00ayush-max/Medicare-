import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { getDoctorById } from "../services/doctorService";
import { getErrorMessage } from "../services/api";
import { formatFee } from "../utils/format";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DoctorDetails() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getDoctorById(id)
      .then((data) => active && setDoctor(data.doctor))
      .catch((err) => active && setError(getErrorMessage(err, "Could not load doctor details.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="container page"><Loader text="Loading doctor..." /></div>;

  if (error || !doctor) {
    return (
      <div className="container page">
        <div className="alert alert-error">{error || "Doctor not found."}</div>
        <Link to="/doctors" className="btn btn-outline">
          Back to doctors
        </Link>
      </div>
    );
  }

  const schedule = [...(doctor.availability || [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  return (
    <div className="container page">
      <Link to="/doctors" className="back-link">
        &larr; Back to doctors
      </Link>

      <div className="detail-layout">
        <section className="panel detail-main">
          <div className="detail-header">
            <div className="doctor-avatar large">
              {doctor.name.replace(/^dr\.?\s*/i, "").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1>{doctor.name}</h1>
              <span className="chip">{doctor.specialization}</span>
            </div>
          </div>

          <dl className="detail-list">
            <div>
              <dt>Experience</dt>
              <dd>{doctor.experience} years</dd>
            </div>
            <div>
              <dt>Qualification</dt>
              <dd>{doctor.qualification}</dd>
            </div>
            <div>
              <dt>Consultation fee</dt>
              <dd>{formatFee(doctor.consultationFee)}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{doctor.email}</dd>
            </div>
          </dl>

          <h3>Weekly schedule</h3>
          {schedule.length === 0 ? (
            <p className="muted">
              This doctor has not published a schedule yet, so no slots can be booked.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Hours</th>
                  <th>Slot length</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s) => (
                  <tr key={s._id || s.day}>
                    <td>{s.day}</td>
                    <td>
                      {s.startTime} - {s.endTime}
                    </td>
                    <td>{s.slotDuration} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <aside className="panel book-box">
          <h3>Book an appointment</h3>
          <p className="muted">Choose a date and an open time slot.</p>
          <Link to={`/book/${doctor._id}`} className="btn btn-primary btn-block">
            Book Appointment
          </Link>
        </aside>
      </div>
    </div>
  );
}
