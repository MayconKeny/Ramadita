import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip,
} from 'chart.js';
import api from '../api/client';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

/**
 * Reemplaza el bloque #page-reportes + loadReportes/buscarHistorial/
 * verTodos/loadPlatosMasPedidos/switchReporteTab del original.
 */
export default function Reportes() {
  const [tab, setTab] = useState('resumen');

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={'btn' + (tab === 'resumen' ? ' btn-gold' : '')} onClick={() => setTab('resumen')}>
          Resumen del dia
        </button>
        <button className={'btn' + (tab === 'historial' ? ' btn-gold' : '')} onClick={() => setTab('historial')}>
          Historial de ventas
        </button>
        <button className={'btn' + (tab === 'platos' ? ' btn-gold' : '')} onClick={() => setTab('platos')}>
          Platos mas pedidos
        </button>
      </div>

      {tab === 'resumen' && <TabResumen />}
      {tab === 'historial' && <TabHistorial />}
      {tab === 'platos' && <TabPlatos />}
    </>
  );
}

function TabResumen() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const [resPedidos, resInv, resVentas] = await Promise.all([
      api.get('/pedidos'),
      api.get('/inventario'),
      api.get('/pedidos/ventas-por-dia'),
    ]);
    const pedidos = resPedidos.data;
    const inv = resInv.data;

    const total = pedidos.reduce((s, p) => s + p.total, 0);
    const estados = {};
    pedidos.forEach((p) => { estados[p.estado] = (estados[p.estado] || 0) + 1; });
    const bajoStock = inv.filter((i) => i.cantidad <= i.stockMinimo);

    setStats({
      totalPedidos: pedidos.length,
      totalVentas: total,
      promedio: pedidos.length ? total / pedidos.length : 0,
      totalProductos: inv.length,
      estados,
      bajoStock,
    });

    const ventasPorDia = resVentas.data;
    setChartData({
      labels: ventasPorDia.map((d) => d.fecha),
      datasets: [{
        label: 'Ventas (S/)',
        data: ventasPorDia.map((d) => d.totalVentas),
        borderColor: '#13818c',
        backgroundColor: 'rgba(201,168,76,0.15)',
        tension: 0.3,
        fill: true,
      }],
    });
  }

  if (!stats) return <div className="empty-msg">Cargando...</div>;

  return (
    <>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-label">Pedidos hoy</div><div className="stat-value">{stats.totalPedidos}</div></div>
        <div className="stat-card"><div className="stat-label">Ventas hoy</div><div className="stat-value">S/ {stats.totalVentas.toFixed(2)}</div></div>
        <div className="stat-card"><div className="stat-label">Ticket promedio</div><div className="stat-value">S/ {stats.promedio.toFixed(2)}</div></div>
        <div className="stat-card"><div className="stat-label">Productos en stock</div><div className="stat-value">{stats.totalProductos}</div></div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header"><span className="card-title">Estados de pedidos hoy</span></div>
          <div>
            {Object.keys(stats.estados).length === 0 ? (
              <div className="empty-msg">Sin datos</div>
            ) : (
              Object.entries(stats.estados).map(([estado, cant]) => (
                <div className="alert-item" key={estado}>
                  <span>{estado}</span>
                  <span className={`badge badge-${estado.toLowerCase()}`}>{cant}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Inventario critico</span></div>
          <div>
            {stats.bajoStock.length === 0 ? (
              <div className="empty-msg">Todo el stock esta bien</div>
            ) : (
              stats.bajoStock.map((a) => (
                <div className="alert-item" key={a.id}>
                  <span>{a.nombre}</span>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>{a.cantidad} {a.unidad}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Ventas ultimos 30 dias</span></div>
        {chartData && <Line data={chartData} height={80} options={{ maintainAspectRatio: false }} />}
      </div>
    </>
  );
}

function TabHistorial() {
  const [fecha, setFecha] = useState('');
  const [pedidos, setPedidos] = useState(null);
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    verTodos();
  }, []);

  async function buscarHistorial() {
    if (!fecha) { alert('Selecciona una fecha.'); return; }
    const res = await api.get('/pedidos/historial', { params: { fecha } });
    setPedidos(res.data);
    setTitulo('Pedidos del ' + fecha);
  }

  async function verTodos() {
    const res = await api.get('/pedidos/historial');
    setPedidos(res.data);
    setTitulo('Todos los pedidos (ultimos 200)');
  }

  const total = pedidos ? pedidos.reduce((s, p) => s + p.total, 0) : 0;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Historial de pedidos</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} />
          <button className="btn btn-gold" onClick={buscarHistorial}>Buscar</button>
          <button className="btn" onClick={verTodos}>Ver todos</button>
        </div>
      </div>
      {pedidos && (
        <div style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>
          {titulo} — {pedidos.length} pedidos — Total: S/ {total.toFixed(2)}
        </div>
      )}
      <table>
        <thead><tr><th>#</th><th>Fecha</th><th>Hora</th><th>Mesa</th><th>Mesero</th><th>Total</th><th>Estado</th></tr></thead>
        <tbody>
          {!pedidos ? (
            <tr><td colSpan="7" className="empty-msg">Cargando...</td></tr>
          ) : pedidos.length === 0 ? (
            <tr><td colSpan="7" className="empty-msg">Sin pedidos para esta fecha</td></tr>
          ) : (
            pedidos.map((p) => {
              const dt = p.createdAt ? new Date(p.createdAt) : null;
              const fechaStr = dt ? dt.toLocaleDateString('es-PE') : '-';
              const horaStr = dt ? dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-';
              return (
                <tr key={p.id}>
                  <td>#{p.id}</td><td>{fechaStr}</td><td>{horaStr}</td><td>Mesa {p.mesa}</td>
                  <td>{p.mesero || '-'}</td><td>S/ {p.total.toFixed(2)}</td>
                  <td><span className={`badge badge-${p.estado.toLowerCase()}`}>{p.estado}</span></td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function TabPlatos() {
  const [platos, setPlatos] = useState(null);

  useEffect(() => {
    api.get('/pedidos/platos-mas-pedidos').then((res) => setPlatos(res.data));
  }, []);

  return (
    <div className="card">
      <div className="card-header"><span className="card-title">Ranking de platos mas pedidos (historico)</span></div>
      <table>
        <thead><tr><th>#</th><th>Plato</th><th>Cantidad vendida</th><th>Total recaudado</th></tr></thead>
        <tbody>
          {!platos ? (
            <tr><td colSpan="4" className="empty-msg">Cargando...</td></tr>
          ) : platos.length === 0 ? (
            <tr><td colSpan="4" className="empty-msg">Sin datos</td></tr>
          ) : (
            platos.map((p, i) => {
              const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1;
              return (
                <tr key={p.nombre}>
                  <td>{medalla}</td>
                  <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                  <td>{p.cantidad} unidades</td>
                  <td>S/ {Number(p.totalVenta).toFixed(2)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
