import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Reemplaza, en el lado del frontend, la primera parte de RolFilter.java:
 * "si no hay sesion, redirige a login". La parte de "que accion puede
 * hacer cada rol" sigue viviendo en el backend (SecurityConfig) como la
 * fuente de verdad real -- esto es solo para que la interfaz no muestre
 * botones que el usuario no podria usar de todas formas.
 *
 * rolesPermitidos es opcional: si se pasa, solo esos roles ven la pagina;
 * si no se pasa, alcanza con estar logueado (igual que el original
 * permitia a cualquier rol entrar a index.jsp).
 */
export default function RutaProtegida({ children, rolesPermitidos }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Cargando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Acceso denegado</h2>
        <p>Tu rol ({usuario.rol}) no tiene permiso para ver esta página.</p>
      </div>
    );
  }

  return children;
}
