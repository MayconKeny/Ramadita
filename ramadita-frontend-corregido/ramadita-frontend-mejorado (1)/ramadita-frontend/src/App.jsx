import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Carta from './pages/Carta';
import Mesas from './pages/Mesas';
import Pedidos from './pages/Pedidos';
import Cocina from './pages/Cocina';
import Caja from './pages/Caja';
import Reportes from './pages/Reportes';
import Inventario from './pages/Inventario';
import Promociones from './pages/Promociones';
import Clientes from './pages/Clientes';
import Proveedores from './pages/Proveedores';
import Usuarios from './pages/Usuarios';

// Redirige "/" a la primera pagina que el rol del usuario puede ver.
function InicioPorRol() {
  const { usuario } = useAuth();
  const destinoPorRol = {
    ADMIN: '/dashboard',
    MESERO: '/pedidos',
    CAJERO: '/pedidos',
    COCINA: '/cocina',
  };
  return <Navigate to={destinoPorRol[usuario.rol] || '/dashboard'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RutaProtegida>
                <Layout />
              </RutaProtegida>
            }
          >
            <Route index element={<RutaProtegida><InicioPorRol /></RutaProtegida>} />
            <Route path="dashboard" element={<RutaProtegida rolesPermitidos={['ADMIN']}><Dashboard /></RutaProtegida>} />
            <Route path="pedidos" element={<RutaProtegida rolesPermitidos={['ADMIN', 'MESERO', 'CAJERO']}><Pedidos /></RutaProtegida>} />
            <Route path="mesas" element={<RutaProtegida rolesPermitidos={['ADMIN', 'MESERO']}><Mesas /></RutaProtegida>} />
            <Route path="carta" element={<RutaProtegida rolesPermitidos={['ADMIN', 'MESERO']}><Carta /></RutaProtegida>} />
            <Route path="cocina" element={<RutaProtegida rolesPermitidos={['ADMIN', 'COCINA']}><Cocina /></RutaProtegida>} />
            <Route path="caja" element={<RutaProtegida rolesPermitidos={['ADMIN', 'CAJERO']}><Caja /></RutaProtegida>} />
            <Route path="reportes" element={<RutaProtegida rolesPermitidos={['ADMIN']}><Reportes /></RutaProtegida>} />
            <Route path="inventario" element={<RutaProtegida rolesPermitidos={['ADMIN']}><Inventario /></RutaProtegida>} />
            <Route path="promociones" element={<RutaProtegida rolesPermitidos={['ADMIN']}><Promociones /></RutaProtegida>} />
            <Route path="clientes" element={<RutaProtegida rolesPermitidos={['ADMIN']}><Clientes /></RutaProtegida>} />
            <Route path="proveedores" element={<RutaProtegida rolesPermitidos={['ADMIN']}><Proveedores /></RutaProtegida>} />
            <Route path="usuarios" element={<RutaProtegida rolesPermitidos={['ADMIN']}><Usuarios /></RutaProtegida>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
