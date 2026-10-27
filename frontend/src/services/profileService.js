import api from "./api";

export const getProfile = () => api.get("/profile").then((r) => r.data);

// Only `name` is persisted by the current backend schema.
export const updateProfile = (data) => api.put("/profile", data).then((r) => r.data);
