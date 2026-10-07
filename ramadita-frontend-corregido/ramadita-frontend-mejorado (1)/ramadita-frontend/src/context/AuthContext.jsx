import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

/**
 * Reemplaza el equivalente de session.getAttribute("usuarioLogueado") /
 * "nombreUsuario" / "rolUsuario" que index.jsp leia directo de la sesion
 * del servidor. Aqui se guarda en memoria de React y se sincroniza con
 * el backend a traves de /api/auth/me.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null); // { usuario, nombre, rol }
  const [cargando, setCargando] = useState(true);

  // Al cargar la app (o recargar la pagina), preguntamos al backend
  // si ya hay una sesion activa (cookie JSESSIONID valida).
  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setUsuario(res.data))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  async function login(usuarioInput, contrasena) {
    const body = new URLSearchParams();
    body.append('username', usuarioInput);
    body.append('password', contrasena);

    // El endpoint /login lo provee Spring Security (formLogin), no /api.
    // Por eso usamos fetch directo en vez de la instancia "api" (que apunta a /api).
    const resp = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body,
    });
    const data = await resp.json();

    if (data.success) {
      setUsuario({ usuario: data.usuario, nombre: data.usuario, rol: data.rol });
      // Pedimos /me para obtener el nombre completo real (formLogin solo devuelve el username)
      const me = await api.get('/auth/me');
      setUsuario(me.data);
      return { success: true };
    }
    return { success: false, error: data.error || 'Usuario o contrasena incorrectos' };
  }

  async function logout() {
    await fetch('/logout', { method: 'POST', credentials: 'include' });
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
