// src/api/axiosClient.ts
import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // CRÍTICO: Permite el envío de cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para transformar los errores del backend
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Intenta extraer el mensaje en diferentes formatos comunes
    const backendData = error.response?.data;
    const message = 
      backendData?.error || 
      backendData?.mensaje || 
      backendData?.message || 
      'Error de conexión con el servidor';
      
    return Promise.reject(new Error(message));
  }
);
