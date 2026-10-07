import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Reemplaza el sidebar de index.jsp, incluyendo la navegacion condicional
 * por rol que antes se armaba con <% if (rolUsuario...) %>.
 *
 * Nota: a diferencia del original, al CAJERO no le muestro "Reportes"
 * aunque el JSP original si lo mostraba en el sidebar -- el backend
 * (RolFilter original y ahora SecurityConfig) nunca le dio permiso real
 * a esa accion, asi que mostrarla era un boton que fallaba al hacer clic.
 * Aqui el sidebar queda fiel a lo que el backend de verdad permite.
 */
const ITEMS_POR_ROL = {
  ADMIN: [
    { seccion: 'Principal', items: [{ to: '/dashboard', icono: '▣', label: 'Dashboard' }] },
    {
      seccion: 'Modulos',
      items: [
        { to: '/pedidos', icono: '📋', label: 'Rama-Pedidos' },
        { to: '/mesas', icono: '🍽', label: 'Mesas' },
        { to: '/carta', icono: '🍽️', label: 'Carta del Menu' },
        { to: '/inventario', icono: '📦', label: 'Maris-Inventario' },
        { to: '/cocina', icono: '👨‍🍳', label: 'Rama-Cocina' },
        { to: '/caja', icono: '💵', label: 'Caja del Dia' },
      ],
    },
    { seccion: 'Reportes', items: [{ to: '/reportes', icono: '📊', label: 'Reportes' }] },
    {
      seccion: 'Clientes y ventas',
      items: [
        { to: '/promociones', icono: '🏷️', label: 'Promociones' },
        { to: '/clientes', icono: '⭐', label: 'Clientes frecuentes' },
        { to: '/proveedores', icono: '🚚', label: 'Proveedores' },
      ],
    },
    { seccion: 'Sistema', items: [{ to: '/usuarios', icono: '👥', label: 'Usuarios' }] },
  ],
  MESERO: [
    {
      seccion: 'Mi Turno',
      items: [
        { to: '/pedidos', icono: '📋', label: 'Rama-Pedidos' },
        { to: '/mesas', icono: '🍽', label: 'Mesas' },
        { to: '/carta', icono: '🍽️', label: 'Carta del Menu' },
      ],
    },
  ],
  CAJERO: [
    {
      seccion: 'Mi Turno',
      items: [
        { to: '/pedidos', icono: '📋', label: 'Pedidos del Día' },
        { to: '/caja', icono: '💵', label: 'Caja del Día' },
      ],
    },
  ],
  COCINA: [
    { seccion: 'Cocina', items: [{ to: '/cocina', icono: '👨‍🍳', label: 'Rama-Cocina' }] },
  ],
};

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const grupos = ITEMS_POR_ROL[usuario.rol] || [];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Marisqueria</div>
        <div className="sidebar-title">La Ramadita</div>
        <div className="sidebar-sub">Sistema de Gestion</div>
      </div>

      <div style={{ padding: '8px 0', flex: 1 }}>
        {grupos.map((grupo) => (
          <div key={grupo.seccion}>
            <div className="nav-section">{grupo.seccion}</div>
            {grupo.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                {item.icono} {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>{usuario.nombre}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{usuario.rol}</div>
        <button
          onClick={logout}
          style={{
            display: 'block', marginTop: 8, fontSize: 12, color: '#13818c',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}
