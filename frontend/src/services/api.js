import axios from "axios";

const rawApiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_BASE_URL = rawApiUrl.replace(/\/+$/, "").endsWith("/api")
  ? rawApiUrl.replace(/\/+$/, "")
  : `${rawApiUrl.replace(/\/+$/, "")}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔥 Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
