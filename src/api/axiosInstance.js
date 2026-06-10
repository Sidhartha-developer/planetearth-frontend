import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
});

// 🔐 REQUEST INTERCEPTOR — attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 RESPONSE INTERCEPTOR — handle expired / invalid token
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or invalid token. Logging out.");

      // 🔥 CLEAR AUTH DATA
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 🔁 REDIRECT TO LOGIN
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
