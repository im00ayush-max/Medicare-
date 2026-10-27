import api from "./api";

export const register = (data) => api.post("/auth/register", data).then((r) => r.data);
export const login = (data) => api.post("/auth/login", data).then((r) => r.data);
export const sendOtp = (email) => api.post("/auth/send-otp", { email }).then((r) => r.data);
export const verifyOtp = (email, otp) =>
  api.post("/auth/verify-otp", { email, otp }).then((r) => r.data);
