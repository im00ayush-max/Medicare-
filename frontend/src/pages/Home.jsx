import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import Loader from "../components/Loader";
import { getDoctors } from "../services/doctorService";
import { getErrorMessage } from "../services/api";

// Department shortcuts. Each links to the doctors page filtered by specialization.
const SERVICES = [
  { title: "Cardiology", icon: "❤", text: "Heart health, blood pressure and cardiac care." },
  { title: "Neurology", icon: "🧠", text: "Care for the brain, spine and nervous system." },
  { title: "Pediatrics", icon: "👶", text: "Gentle healthcare for infants and children." },
  { title: "Orthopedics", icon: "🦴", text: "Bones, joints and sports injury treatment." },
  { title: "Dermatology", icon: "✨", text: "Skin, hair and nail conditions." },
  { title: "General Medicine", icon: "🩺", text: "Everyday health concerns and check-ups." },
];

const STEPS = [
  { n: 1, title: "Find a doctor", text: "Search by name or specialization and compare experience and fees." },
  { n: 2, title: "Pick a time slot", text: "Choose a date and select an open slot from the doctor's schedule." },
  { n: 3, title: "Get confirmed", text: "Book in seconds and track or cancel from your dashboard." },
];

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getDoctors({ sort: "experience", limit: 3 })
      .then((data) => active && setDoctors(data.doctors || []))
      .catch((err) => active && setError(getErrorMessage(err, "Could not load doctors.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-tag">Trusted care, made simple</span>
            <h1>Your health, one appointment away.</h1>
            <p>
              Book appointments with experienced specialists online. Choose your doctor, pick a
              time that suits you and manage everything in one place.
            </p>
            <div className="hero-buttons">
              <Link to="/doctors" className="btn btn-primary btn-lg">
                Book Appointment
              </Link>
              <Link to="/register" className="btn btn-outline-light btn-lg">
                Create Free Account
              </Link>
            </div>
          </div>
          <div className="hero-card" aria-hidden="true">
            <div className="hero-card-icon">+</div>
            <h3>Quick online booking</h3>
            <ul>
              <li>Verified specialists</li>
              <li>Live slot availability</li>
              <li>Easy cancellation</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Our Healthcare Services</h2>
            <p>Select a department to see the doctors available for it.</p>
          </div>
          <div className="service-grid">
            {SERVICES.map((s) => (
              <Link
                key={s.title}
                to={`/doctors?specialization=${encodeURIComponent(s.title)}`}
                className="service-card"
              >
                <span className="service-icon">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Featured Doctors</h2>
            <p>Our most experienced specialists.</p>
          </div>
          {loading && <Loader text="Loading doctors..." />}
          {error && <div className="alert alert-error">{error}</div>}
          {!loading && !error && doctors.length === 0 && (
            <p className="muted center">No doctors have been added yet.</p>
          )}
          <div className="doctor-grid">
            {doctors.map((d) => (
              <DoctorCard key={d._id} doctor={d} />
            ))}
          </div>
          <div className="center mt-2">
            <Link to="/doctors" className="btn btn-outline">
              View All Doctors
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>How It Works</h2>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div key={s.n} className="step">
                <span className="step-number">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <h2>Ready to see a doctor?</h2>
          <p>Create an account and book your first appointment today.</p>
          <Link to="/doctors" className="btn btn-light btn-lg">
            Book Appointment
          </Link>
        </div>
      </section>
    </>
  );
}
