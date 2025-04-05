import axios from 'axios';

const api = axios.create({
  baseURL: 'https://search-engine-sitt.onrender.com',
  withCredentials: true,
});

// Response interceptor to catch 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      alert("Please login to your account.");
      window.location.href = "/login"; // Optionally redirect to the login page
    }
    return Promise.reject(error);
  }
);

export default api;

