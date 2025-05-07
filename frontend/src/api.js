import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:5000', // Replace with your backend URL
//   withCredentials: true,
// });


//For production
const api = axios.create({
  baseURL: '/', // Replace with your backend URL
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

