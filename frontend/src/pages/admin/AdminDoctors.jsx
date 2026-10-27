import { useCallback, useEffect, useState } from "react";
import DoctorForm from "../../components/DoctorForm";
import Loader from "../../components/Loader";
import { useToast } from "../../context/ToastContext";
import { addDoctor, getDoctors, updateDoctor } from "../../services/doctorService";
import { getErrorMessage } from "../../services/api";
import { formatFee } from "../../utils/format";

const PAGE_SIZE = 10;

export default function AdminDoctors() {
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // null = form closed, "new" = add form, otherwise the doctor being edited
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDoctors({ page, limit: PAGE_SIZE });
      setDoctors(data.doctors || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load doctors."));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async ({ details, availability }) => {
    setSubmitting(true);
    try {
      if (editing === "new") {
        // POST /doctors ignores availability, so the schedule is saved with a follow-up PUT.
        const created = await addDoctor(details);
        if (availability.length > 0) {
          try {
            await updateDoctor(created.doctor._id, { availability });
          } catch (err) {
            toast.error(
              `Doctor added, but the schedule was not saved: ${getErrorMessage(err)}. Edit the doctor to retry.`
            );
            setEditing(null);
            await load();
            return;
          }
        }
        toast.success("Doctor added successfully.");
      } else {
        await updateDoctor(editing._id, { ...details, availability });
        toast.success("Doctor updated successfully.");
      }
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the doctor."));
    } finally {
      setSubmitting(false);
    }
  };

  if (editing) {
    return (
      <div className="container page">
        <DoctorForm
          key={editing === "new" ? "new" : editing._id}
          doctor={editing === "new" ? null : editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-head row-between">
        <div>
          <h1>Manage Doctors</h1>
          <p>Add new doctors or update existing profiles and schedules.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}>
          + Add Doctor
        </button>
      </div>

      {loading && <Loader text="Loading doctors..." />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && doctors.length === 0 && (
        <div className="empty-state">
          <h3>No doctors found</h3>
          <p>Add the first doctor to get started.</p>
        </div>
      )}

      {!loading && doctors.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Schedule</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d._id}>
                    <td data-label="Name">
                      <strong>{d.name}</strong>
                      <div className="muted small">{d.email}</div>
                    </td>
                    <td data-label="Specialization">{d.specialization}</td>
                    <td data-label="Experience">{d.experience} yrs</td>
                    <td data-label="Fee">{formatFee(d.consultationFee)}</td>
                    <td data-label="Schedule">
                      {d.availability?.length ? (
                        `${d.availability.length} day(s)`
                      ) : (
                        <span className="badge badge-pending">not set</span>
                      )}
                    </td>
                    <td data-label="Actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditing(d)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={doctors.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
