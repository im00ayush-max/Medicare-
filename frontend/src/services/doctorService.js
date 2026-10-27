import api from "./api";

export const getDoctors = (params = {}) => api.get("/doctors", { params }).then((r) => r.data);

export const getDoctorById = (id) => api.get(`/doctors/${id}`).then((r) => r.data);

export const getAvailability = (doctorId, date) =>
  api.get(`/doctors/${doctorId}/availability`, { params: { date } }).then((r) => r.data);

// Admin only
export const addDoctor = (data) => api.post("/doctors", data).then((r) => r.data);

export const updateDoctor = (id, data) => api.put(`/doctors/${id}`, data).then((r) => r.data);
