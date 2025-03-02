import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/strelive-api/api",
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  if (user?.accessToken) {
    config.headers.Authorization = `Bearer ${user.accessToken}`;
  }
  return config;
});

export default api;
