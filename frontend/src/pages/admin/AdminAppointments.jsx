import { useCallback, useEffect, useState } from "react";
import Loader from "../../components/Loader";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../context/ToastContext";
import { getAllAppointments, updateAppointmentStatus } from "../../services/appointmentService";
import { getErrorMessage } from "../../services/api";
import { formatDateTime } from "../../utils/format";

// The backend only accepts these three values for status updates.
const STATUS_OPTIONS = ["pending", "confirmed", "cancelled"];

export default function AdminAppointments() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load appointments."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (appointment, status) => {
    if (status === appointment.status) return;
    setSavingId(appointment._id);
    try {
      const data = await updateAppointmentStatus(appointment._id, status);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointment._id ? { ...a, status: data.appointment.status } : a))
      );
      toast.success(`Appointment marked as ${status}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the status."));
    } finally {
      setSavingId(null);
    }
  };

  const visible =
    filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="container page">
      <div className="page-head row-between">
        <div>
          <h1>All Appointments</h1>
          <p>{appointments.length} total bookings</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter by status"
          className="inline-select"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading && <Loader text="Loading appointments..." />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && visible.length === 0 && (
        <div className="empty-state">
          <h3>No appointments found</h3>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date &amp; time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Update status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a._id}>
                  <td data-label="Patient">
                    {a.patientId ? (
                      <>
                        <strong>{a.patientId.name}</strong>
                        <div className="muted small">{a.patientId.email}</div>
                      </>
                    ) : (
                      <span className="muted">Patient record unavailable</span>
                    )}
                  </td>
                  <td data-label="Doctor">
                    {a.doctorId ? (
                      <>
                        {a.doctorId.name}
                        <div className="muted small">{a.doctorId.specialization}</div>
                      </>
                    ) : (
                      <span className="muted">Doctor record unavailable</span>
                    )}
                  </td>
                  <td data-label="Date & time">{formatDateTime(a.appointmentTime)}</td>
                  <td data-label="Reason">{a.reason}</td>
                  <td data-label="Status">
                    <StatusBadge status={a.status} />
                  </td>
                  <td data-label="Update status">
                    {a.status === "completed" ? (
                      <span className="muted small">Not editable</span>
                    ) : (
                      <select
                        value={a.status}
                        disabled={savingId === a._id}
                        onChange={(e) => handleStatusChange(a, e.target.value)}
                        aria-label="Update appointment status"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
