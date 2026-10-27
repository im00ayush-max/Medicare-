import { Link } from "react-router-dom";
import { formatFee } from "../utils/format";

const initials = (name = "") =>
  name
    .replace(/^dr\.?\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export default function DoctorCard({ doctor }) {
  return (
    <article className="doctor-card">
      <div className="doctor-avatar">{initials(doctor.name)}</div>
      <h3>{doctor.name}</h3>
      <span className="chip">{doctor.specialization}</span>
      <ul className="doctor-meta">
        <li>
          <strong>{doctor.experience}</strong> yrs experience
        </li>
        <li>{doctor.qualification}</li>
        <li>
          Consultation: <strong>{formatFee(doctor.consultationFee)}</strong>
        </li>
      </ul>
      <div className="doctor-actions">
        <Link to={`/doctors/${doctor._id}`} className="btn btn-outline btn-sm">
          View Profile
        </Link>
        <Link to={`/book/${doctor._id}`} className="btn btn-primary btn-sm">
          Book Now
        </Link>
      </div>
    </article>
  );
}
