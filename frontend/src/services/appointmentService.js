import api from "./api";

export const bookAppointment = (data) => api.post("/appointments", data).then((r) => r.data);

export const getMyAppointments = () =>
  api.get("/appointments/my-appointments").then((r) => r.data);

export const cancelAppointment = (id) =>
  api.patch(`/appointments/${id}/cancel`).then((r) => r.data);

// Admin only
export const getAllAppointments = () => api.get("/appointments").then((r) => r.data);

export const updateAppointmentStatus = (id, status) =>
  api.patch(`/appointments/${id}/status`, { status }).then((r) => r.data);
