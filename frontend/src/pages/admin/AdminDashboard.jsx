import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import StatCard from "../../components/StatCard";
import { getAdminDashboard } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminDashboard()
      .then((data) => active && setStats(data.stats))
      .catch((err) => active && setError(getErrorMessage(err, "Could not load dashboard data.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Admin Dashboard</h1>
        <p>Overview of patients, doctors and appointments.</p>
      </div>

      {loading && <Loader text="Loading statistics..." />}
      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <div className="stat-grid">
          <StatCard label="Total Patients" value={stats.totalPatients} tone="blue" />
          <StatCard label="Total Doctors" value={stats.totalDoctors} tone="teal" />
          <StatCard label="Total Appointments" value={stats.totalAppointments} tone="indigo" />
          <StatCard label="Pending" value={stats.pendingAppointments} tone="amber" />
          <StatCard label="Confirmed" value={stats.confirmedAppointments} tone="green" />
          <StatCard label="Cancelled" value={stats.cancelledAppointments} tone="red" />
        </div>
      )}

      <div className="quick-links">
        <Link to="/admin/appointments" className="panel quick-link">
          <h3>Manage Appointments</h3>
          <p>Review all bookings and update their status.</p>
        </Link>
        <Link to="/admin/doctors" className="panel quick-link">
          <h3>Manage Doctors</h3>
          <p>Add doctors, edit details and set weekly schedules.</p>
        </Link>
      </div>
    </div>
  );
}
