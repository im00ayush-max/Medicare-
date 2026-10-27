import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { cancelAppointment, getMyAppointments } from "../services/appointmentService";
import { getProfile, updateProfile } from "../services/profileService";
import { getErrorMessage } from "../services/api";
import { formatDate, formatDateTime, formatFee } from "../utils/format";

function AppointmentsTab() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your appointments."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setCancellingId(id);
    try {
      await cancelAppointment(id);
      toast.success("Appointment cancelled.");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not cancel the appointment."));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loader text="Loading appointments..." />;
  if (error) return <div className="alert alert-error">{error}</div>;

  if (appointments.length === 0) {
    return (
      <div className="empty-state">
        <h3>No appointments yet</h3>
        <p>Find a doctor and book your first appointment.</p>
        <Link to="/doctors" className="btn btn-primary">
          Find a Doctor
        </Link>
      </div>
    );
  }

  return (
    <div className="appointment-list">
      {appointments.map((a) => {
        const canCancel = a.status === "pending" || a.status === "confirmed";
        return (
          <article key={a._id} className="appointment-card">
            <div className="appointment-top">
              <div>
                <h3>{a.doctorId?.name || "Doctor unavailable"}</h3>
                <span className="muted">{a.doctorId?.specialization}</span>
              </div>
              <StatusBadge status={a.status} />
            </div>
            <dl className="appointment-details">
              <div>
                <dt>Date &amp; time</dt>
                <dd>{formatDateTime(a.appointmentTime)}</dd>
              </div>
              <div>
                <dt>Reason</dt>
                <dd>{a.reason}</dd>
              </div>
              {a.doctorId && (
                <div>
                  <dt>Fee</dt>
                  <dd>{formatFee(a.doctorId.consultationFee)}</dd>
                </div>
              )}
              <div>
                <dt>Booked on</dt>
                <dd>{formatDate(a.createdAt)}</dd>
              </div>
            </dl>
            {canCancel && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={cancellingId === a._id}
                onClick={() => handleCancel(a._id)}
              >
                {cancellingId === a._id ? "Cancelling..." : "Cancel Appointment"}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}

function ProfileTab() {
  const { updateUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getProfile()
      .then((data) => {
        if (!active) return;
        setProfile(data.user);
        setName(data.user.name);
      })
      .catch((err) => active && setError(getErrorMessage(err, "Could not load your profile.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError("");
    if (!name.trim()) {
      setNameError("Name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const data = await updateProfile({ name: name.trim() });
      setProfile(data.user);
      updateUser({ name: data.user.name });
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update your profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading profile..." />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="panel profile-panel">
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="profile-name">Full name</label>
          <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
          {nameError && <span className="field-error">{nameError}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="profile-email">Email</label>
          <input id="profile-email" value={profile.email} disabled />
        </div>
        <div className="form-group">
          <label>Email status</label>
          {profile.isEmailVerified ? (
            <span className="badge badge-confirmed">verified</span>
          ) : (
            <span>
              <span className="badge badge-pending">not verified</span>{" "}
              <Link to="/verify-email" state={{ email: profile.email }}>
                Verify now
              </Link>
            </span>
          )}
        </div>
        <div className="form-group">
          <label>Role</label>
          <span className="chip">{profile.role}</span>
        </div>
        <div className="form-group">
          <label>Member since</label>
          <span>{formatDate(profile.createdAt)}</span>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <p className="muted small mt-1">
          Only your name can be edited. Phone, age and address are not stored by the current backend.
        </p>
      </form>
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("appointments");

  return (
    <div className="container page">
      <div className="page-head row-between">
        <div>
          <h1>My Dashboard</h1>
          <p>Welcome, {user.name}.</p>
        </div>
        <Link to="/doctors" className="btn btn-primary">
          Book New Appointment
        </Link>
      </div>

      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "appointments"}
          className={tab === "appointments" ? "tab active" : "tab"}
          onClick={() => setTab("appointments")}
        >
          My Appointments
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profile"}
          className={tab === "profile" ? "tab active" : "tab"}
          onClick={() => setTab("profile")}
        >
          My Profile
        </button>
      </div>

      {tab === "appointments" ? <AppointmentsTab /> : <ProfileTab />}
    </div>
  );
}
