import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Reemplaza el objeto "titles" que tenia showPage() en el JS original
// para poner el titulo correcto en la topbar segun la pagina activa.
const TITULOS = {
  '/dashboard': 'Dashboard General',
  '/pedidos': 'Modulo: Rama-Pedidos',
  '/carta': 'Modulo: Carta del Menu',
  '/inventario': 'Modulo: Maris-Inventario',
  '/cocina': 'Modulo: Rama-Cocina',
  '/caja': 'Caja del Dia',
  '/reportes': 'Reportes',
  '/usuarios': 'Gestión de Usuarios',
};

export default function Layout() {
  const location = useLocation();
  const titulo = TITULOS[location.pathname] || 'La Ramadita';

  return (
    <div className="app">
      <Sidebar />
      <div className="content">
        <Topbar titulo={titulo} />
        <div className="page active">
          {/* Aqui se renderiza la pagina actual (Dashboard, Pedidos, Carta, etc.) */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
