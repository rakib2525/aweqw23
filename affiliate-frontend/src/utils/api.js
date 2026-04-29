import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ===============================
// 🔥 REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ===============================
// 🔥 TOKEN REFRESH SYSTEM
// ===============================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ===============================
// 🔥 RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  (res) => res,

  async (err) => {
    const originalRequest = err.config;

    if (!err.response) {
      return Promise.reject(err);
    }

    // ===============================
    // 🔥 HANDLE 401
    // ===============================
    if (err.response.status === 401 && !originalRequest._retry) {

      if (originalRequest.url.includes("/auth/refresh")) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }

      originalRequest._retry = true;

      // ===============================
      // 🔁 QUEUE SYSTEM
      // ===============================
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        console.log("🔄 Refreshing token...");

        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // 🔥 CALL REFRESH API
        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          { refreshToken }
        );

        // ✅ FIXED (VERY IMPORTANT)
        const newAccessToken = res.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("Invalid refresh response");
        }

        // ✅ SAVE TOKEN
        localStorage.setItem("accessToken", newAccessToken);

        // ✅ UPDATE HEADER
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);

        console.log("❌ Refresh failed → logout");

        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;