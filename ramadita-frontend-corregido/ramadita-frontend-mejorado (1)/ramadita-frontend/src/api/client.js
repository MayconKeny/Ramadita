import axios from 'axios';

/**
 * Cliente HTTP central para toda la app.
 *
 * withCredentials: true es CLAVE: Spring Security usa cookies de sesion
 * (JSESSIONID), no tokens JWT. Sin esto, el navegador no manda la cookie
 * en cada peticion y el backend pensaria que nadie esta logueado.
 */
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Si el backend responde 401 (sesion expirada o no logueado),
// redirigimos al login automaticamente en toda la app.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
