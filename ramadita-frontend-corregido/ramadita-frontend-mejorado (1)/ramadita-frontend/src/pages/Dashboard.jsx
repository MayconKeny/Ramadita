import { useEffect, useState } from 'react';
import api from '../api/client';

/**
 * Reemplaza el bloque #page-dashboard + la funcion loadDashboard() del
 * index.jsp original. Misma logica de calculo (activos, ventas, cocina)
 * pero ahora usando useState/useEffect en vez de manipular el DOM a mano.
 */
export default function Dashboard() {
  const [stats, setStats] = useState({ pedidos: 0, activos: 0, ventas: 0, stockBajo: 0, cocina: 0 });
  const [recientes, setRecientes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    const [resPedidos, resAlertas] = await Promise.all([
      api.get('/pedidos'),
      api.get('/inventario/alertas'),
    ]);
    const pedidos = resPedidos.data;
    const alertasData = resAlertas.data;

    let activos = 0, ventas = 0, cocina = 0;
    for (const p of pedidos) {
      if (p.estado !== 'Entregado') activos++;
      ventas += p.total;
      if (p.estado === 'Preparando') cocina++;
    }

    setStats({
      pedidos: pedidos.length,
      activos,
      ventas,
      stockBajo: alertasData.length,
      cocina,
    });
    setRecientes(pedidos.slice(-5).reverse());
    setAlertas(alertasData);
    setCargando(false);
  }

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Pedidos hoy</div>
          <div className="stat-value">{cargando ? '-' : stats.pedidos}</div>
          <div className="stat-sub">Activos: {cargando ? '-' : stats.activos}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ventas del dia</div>
          <div className="stat-value">{cargando ? '-' : `S/ ${stats.ventas.toFixed(2)}`}</div>
          <div className="stat-sub">Soles</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Stock bajo</div>
          <div className="stat-value" style={{ color: '#dc2626' }}>{cargando ? '-' : stats.stockBajo}</div>
          <div className="stat-sub">Productos criticos</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">En cocina</div>
          <div className="stat-value">{cargando ? '-' : stats.cocina}</div>
          <div className="stat-sub">Preparando ahora</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header"><span className="card-title">Ultimos pedidos</span></div>
          <table>
            <thead><tr><th>#</th><th>Mesa</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="4" className="empty-msg">Cargando...</td></tr>
              ) : recientes.length ? (
                recientes.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>Mesa {p.mesa}</td>
                    <td>S/ {p.total.toFixed(2)}</td>
                    <td><span className={`badge badge-${p.estado.toLowerCase()}`}>{p.estado}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="empty-msg">Sin pedidos</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Alertas de inventario</span></div>
          <div>
            {cargando ? (
              <div className="empty-msg">Cargando...</div>
            ) : alertas.length ? (
              alertas.map((a) => (
                <div className="alert-item" key={a.id}>
                  <span>{a.nombre}</span>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>{a.cantidad} {a.unidad}</span>
                </div>
              ))
            ) : (
              <div className="empty-msg">Sin alertas de stock</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
