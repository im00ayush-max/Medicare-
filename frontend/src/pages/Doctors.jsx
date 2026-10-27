import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import Loader from "../components/Loader";
import { getDoctors } from "../services/doctorService";
import { getErrorMessage } from "../services/api";

const PAGE_SIZE = 9;

export default function Doctors() {
  const [searchParams] = useSearchParams();

  const [name, setName] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [specialization, setSpecialization] = useState(searchParams.get("specialization") || "");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Specialization options come from real doctor records (backend max page size is 50).
  useEffect(() => {
    getDoctors({ limit: 50 })
      .then((data) => {
        const list = [...new Set((data.doctors || []).map((d) => d.specialization))].sort();
        setSpecializations(list);
      })
      .catch(() => {});
  }, []);

  // Debounce the name search so we don't call the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedName(name.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [name]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const params = { page, limit: PAGE_SIZE };
    if (debouncedName) params.name = debouncedName;
    if (specialization) params.specialization = specialization;
    if (sort) params.sort = sort;

    getDoctors(params)
      .then((data) => active && setDoctors(data.doctors || []))
      .catch((err) => active && setError(getErrorMessage(err, "Could not load doctors.")))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [debouncedName, specialization, sort, page]);

  const clearFilters = () => {
    setName("");
    setDebouncedName("");
    setSpecialization("");
    setSort("");
    setPage(1);
  };

  const hasFilters = name || specialization || sort;

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Find a Doctor</h1>
        <p>Search our specialists and book an appointment.</p>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search by doctor name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Search by doctor name"
        />
        <select
          value={specialization}
          onChange={(e) => {
            setSpecialization(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by specialization"
        >
          <option value="">All specializations</option>
          {specialization && !specializations.includes(specialization) && (
            <option value={specialization}>{specialization}</option>
          )}
          {specializations.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          aria-label="Sort doctors"
        >
          <option value="">Sort: Default</option>
          <option value="experience">Most experienced</option>
          <option value="fee">Lowest fee</option>
        </select>
        {hasFilters && (
          <button type="button" className="btn btn-outline" onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      {loading && <Loader text="Loading doctors..." />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && doctors.length === 0 && (
        <div className="empty-state">
          <h3>No doctors found</h3>
          <p>Try changing your search or filters.</p>
        </div>
      )}

      {!loading && doctors.length > 0 && (
        <>
          <div className="doctor-grid">
            {doctors.map((d) => (
              <DoctorCard key={d._id} doctor={d} />
            ))}
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
