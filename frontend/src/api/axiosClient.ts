import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendData = error.response?.data;
    const message =
      backendData?.error ||
      backendData?.mensaje ||
      backendData?.message ||
      'Error de conexión con el servidor';
    return Promise.reject(new Error(message));
  },
);
