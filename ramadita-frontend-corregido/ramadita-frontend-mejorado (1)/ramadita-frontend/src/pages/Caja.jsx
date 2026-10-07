import { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

const ICONOS_PAGO = { Efectivo: '💵', Yape: '📱', Tarjeta: '💳' };

/**
 * Reemplaza el bloque #page-caja + loadCaja() del original.
 *
 * Nuevo: panel de Turno arriba de todo. Antes esta pagina solo mostraba
 * totales calculados al vuelo sin ningun registro persistido -- no habia
 * forma de saber quien abrio caja, con cuanto, ni si el conteo final
 * de efectivo cuadraba contra lo que el sistema esperaba.
 */
export default function Caja() {
  const [caja, setCaja] = useState(null);
  const [turno, setTurno] = useState(undefined); // undefined = cargando, null = sin turno abierto
  const [cargando, setCargando] = useState(true);
  const [montoInicial, setMontoInicial] = useState('');
  const [montoFinal, setMontoFinal] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mostrarCierre, setMostrarCierre] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    cargar();
    cargarTurno();
  }, []);

  async function cargar() {
    setCargando(true);
    const res = await api.get('/pedidos/caja');
    setCaja(res.data);
    setCargando(false);
  }

  async function cargarTurno() {
    const res = await api.get('/turnos/activo');
    setTurno(res.data.data || null);
  }

  async function abrirTurno() {
    if (!montoInicial.trim()) {
      alert('Ingresa el monto inicial de caja.');
      return;
    }
    try {
      await api.post('/turnos/abrir', { montoInicial: Number(montoInicial) });
      showToast('Turno abierto');
      setMontoInicial('');
      cargarTurno();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  async function cerrarTurno() {
    if (!montoFinal.trim()) {
      alert('Ingresa el monto contado en caja.');
      return;
    }
    try {
      const res = await api.post(`/turnos/${turno.id}/cerrar`, {
        montoFinalContado: Number(montoFinal),
        observaciones,
      });
      const t = res.data.data;
      const dif = Number(t.diferencia);
      showToast(dif === 0 ? 'Turno cerrado, caja cuadrada ✓' : `Turno cerrado. Diferencia: S/ ${dif.toFixed(2)}`);
      setMontoFinal('');
      setObservaciones('');
      setMostrarCierre(false);
      cargarTurno();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  if (cargando || !caja || turno === undefined) {
    return <div className="empty-msg">Cargando caja del dia...</div>;
  }

  const promedio = caja.pedidosCobrados > 0 ? caja.totalCobrado / caja.pedidosCobrados : 0;
  const metodos = Object.entries(caja.porMetodo || {});
  const totalMetodos = metodos.reduce((s, [, monto]) => s + monto, 0);

  return (
    <>
      {/* ---- Panel de turno ---- */}
      <div className="card" style={{ borderLeft: `4px solid ${turno ? '#15803d' : '#e2693f'}` }}>
        <div className="card-header">
          <span className="card-title">
            {turno ? `Turno abierto — folio #${turno.id}` : 'Caja cerrada'}
          </span>
          {turno && <span className="badge badge-ok">ABIERTO</span>}
        </div>

        {!turno ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Monto inicial de caja (vuelto)</label>
              <input type="number" value={montoInicial} onChange={(e) => setMontoInicial(e.target.value)} placeholder="Ej: 50.00" />
            </div>
            <button className="btn btn-gold" onClick={abrirTurno}>Abrir turno</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
              Abierto por <strong>{turno.usuarioApertura}</strong> el {new Date(turno.fechaApertura).toLocaleString('es-PE')} con S/ {Number(turno.montoInicial).toFixed(2)} inicial.
            </div>
            {!mostrarCierre ? (
              <button className="btn btn-danger" onClick={() => setMostrarCierre(true)}>Cerrar turno</button>
            ) : (
              <div style={{ background: 'var(--sand)', padding: 14, borderRadius: 10 }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Efectivo contado en caja</label>
                    <input type="number" value={montoFinal} onChange={(e) => setMontoFinal(e.target.value)} placeholder="Cuenta el efectivo real" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Observaciones (opcional)</label>
                    <input type="text" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-gold" onClick={cerrarTurno}>Confirmar cierre</button>
                  <button className="btn" onClick={() => setMostrarCierre(false)}>Cancelar</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total cobrado hoy</div>
          <div className="stat-value">S/ {caja.totalCobrado.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pedidos cobrados</div>
          <div className="stat-value">{caja.pedidosCobrados}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pendiente de cobro</div>
          <div className="stat-value" style={{ color: '#dc2626' }}>S/ {caja.totalPendiente.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ticket promedio</div>
          <div className="stat-value">S/ {promedio.toFixed(2)}</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header"><span className="card-title">Ingresos por metodo de pago</span></div>
          <div>
            {metodos.length === 0 ? (
              <div className="empty-msg">Sin cobros aun</div>
            ) : (
              metodos.map(([metodo, monto]) => (
                <div className="caja-metodo" key={metodo}>
                  <div className="caja-metodo-icon">{ICONOS_PAGO[metodo] || '💰'}</div>
                  <div className="caja-metodo-label">{metodo}</div>
                  <div className="caja-metodo-monto">S/ {monto.toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '2px solid #e4e1d6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>TOTAL CAJA</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#16302e' }}>S/ {totalMetodos.toFixed(2)}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Ultimos cobros</span></div>
          <table>
            <thead><tr><th>#</th><th>Mesa</th><th>Total</th><th>Pago</th><th>Hora</th></tr></thead>
            <tbody>
              {!caja.cobros || caja.cobros.length === 0 ? (
                <tr><td colSpan="5" className="empty-msg">Sin cobros hoy</td></tr>
              ) : (
                caja.cobros.map((c) => {
                  const hora = c.createdAt ? new Date(c.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-';
                  return (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>Mesa {c.mesa}</td>
                      <td>S/ {c.total.toFixed(2)}</td>
                      <td>{ICONOS_PAGO[c.metodoPago] || '💰'} {c.metodoPago || '-'}</td>
                      <td>{hora}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
