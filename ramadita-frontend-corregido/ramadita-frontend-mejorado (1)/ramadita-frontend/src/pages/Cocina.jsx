import { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

/**
 * Reemplaza el bloque #page-cocina + loadCocina()/cambiarEstado() del original.
 *
 * Nuevo: se conecta a /ws/cocina para recibir un aviso cada vez que entra
 * un pedido nuevo o cambia de estado, y refresca la lista sola -- antes
 * habia que darle "Actualizar" a mano o esperar un refresco de pagina.
 */
export default function Cocina() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enVivo, setEnVivo] = useState(false);
  const showToast = useToast();
  const wsRef = useRef(null);

  useEffect(() => {
    cargar();
    conectarWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  function conectarWebSocket() {
    const protocolo = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocolo}://${window.location.host}/ws/cocina`);

    ws.onopen = () => setEnVivo(true);
    ws.onclose = () => {
      setEnVivo(false);
      // Si se corta la conexion (backend reiniciado, red, etc.) reintenta a los 3s.
      setTimeout(conectarWebSocket, 3000);
    };
    ws.onmessage = (evento) => {
      if (evento.data === 'pedido-nuevo') {
        showToast('¡Pedido nuevo en cocina!');
      }
      cargar();
    };

    wsRef.current = ws;
  }

  async function cargar() {
    setCargando(true);
    const res = await api.get('/pedidos/cocina');
    setPedidos(res.data);
    setCargando(false);
  }

  async function cambiarEstado(id, estado) {
    try {
      await api.post(`/pedidos/${id}/estado`, { estado });
      showToast('Estado actualizado');
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
          Pedidos activos en preparación
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600,
            color: enVivo ? '#15803d' : 'var(--muted)',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: enVivo ? '#22c55e' : '#cbd5c9',
              display: 'inline-block',
            }} />
            {enVivo ? 'En vivo' : 'Conectando...'}
          </span>
        </div>
        <button className="btn btn-gold" onClick={cargar}>Actualizar</button>
      </div>

      <div className="cocina-grid">
        {cargando ? (
          <div className="empty-msg" style={{ gridColumn: '1/-1' }}>Cargando...</div>
        ) : pedidos.length === 0 ? (
          <div className="empty-msg" style={{ gridColumn: '1/-1' }}>No hay pedidos activos en cocina.</div>
        ) : (
          pedidos.map((p) => {
            const hora = p.createdAt ? new Date(p.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-';
            const urgente = p.estado === 'Pendiente' ? ' urgente' : '';
            return (
              <div className={'cocina-card' + urgente} key={p.id}>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Mesa {p.mesa} · Pedido #{p.id}</div>
                <div style={{ fontSize: 20, fontWeight: 600, margin: '4px 0' }}>
                  {p.detalles ? p.detalles.length : 0} plato(s)
                </div>
                {p.detalles && p.detalles.map((d) => (
                  <div key={d.id} style={{ fontSize: 13, margin: '2px 0' }}>· {d.platoNombre} x{d.cantidad}</div>
                ))}
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{hora} · {p.mesero || '-'}</div>
                <div style={{ marginTop: 10 }}>
                  {p.estado === 'Pendiente' ? (
                    <button className="btn btn-sm btn-success" onClick={() => cambiarEstado(p.id, 'Preparando')}>
                      Iniciar cocina
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-gold" onClick={() => cambiarEstado(p.id, 'Listo')}>
                      Listo
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className={`badge badge-${p.estado.toLowerCase()}`}>{p.estado}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
