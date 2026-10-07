import { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

const COLORES_ESTADO = {
  LIBRE: { bg: '#dcfce7', color: '#15803d', label: 'Libre' },
  OCUPADA: { bg: '#fdece4', color: '#b4491f', label: 'Ocupada' },
  RESERVADA: { bg: '#dbeef0', color: '#0e5c64', label: 'Reservada' },
};

/**
 * Mapa de mesas del local: antes "mesa" era solo un numero suelto que el
 * mesero escribia al registrar un pedido, sin saber si esa mesa ya estaba
 * ocupada por otro mesero. Esta pagina muestra el estado real de cada
 * mesa (se actualiza sola cuando se registra o se cobra un pedido, ver
 * MesaService en el backend) y permite reservarlas/liberarlas a mano.
 */
export default function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoNumero, setNuevoNumero] = useState('');
  const [nuevaCapacidad, setNuevaCapacidad] = useState('4');
  const showToast = useToast();

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    const res = await api.get('/mesas');
    setMesas(res.data);
    setCargando(false);
  }

  async function crearMesa() {
    if (!nuevoNumero.trim()) {
      alert('Ingresa el numero de mesa.');
      return;
    }
    try {
      await api.post('/mesas', {
        numero: Number(nuevoNumero),
        capacidad: Number(nuevaCapacidad) || 4,
        estado: 'LIBRE',
      });
      showToast('Mesa creada');
      setNuevoNumero('');
      setNuevaCapacidad('4');
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'ya existe una mesa con ese numero'));
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      await api.post(`/mesas/${id}/estado`, { estado });
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta mesa?')) return;
    try {
      await api.delete(`/mesas/${id}`);
      showToast('Mesa eliminada');
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Agregar mesa</div>
        </div>
        <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr auto', alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">Número de mesa</label>
            <input type="number" value={nuevoNumero} onChange={(e) => setNuevoNumero(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Capacidad (personas)</label>
            <input type="number" value={nuevaCapacidad} onChange={(e) => setNuevaCapacidad(e.target.value)} />
          </div>
          <button className="btn btn-gold" onClick={crearMesa}>Agregar mesa</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: 'var(--muted)' }}>
        {Object.entries(COLORES_ESTADO).map(([key, v]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.color, display: 'inline-block' }} />
            {v.label}
          </div>
        ))}
      </div>

      {cargando ? (
        <div className="empty-msg">Cargando...</div>
      ) : mesas.length === 0 ? (
        <div className="empty-msg">Todavía no hay mesas registradas. Agrega la primera arriba.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
          {mesas.map((m) => {
            const info = COLORES_ESTADO[m.estado] || COLORES_ESTADO.LIBRE;
            return (
              <div key={m.id} className="card" style={{ margin: 0, textAlign: 'center', borderTop: `3px solid ${info.color}` }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--tide-900)' }}>
                  {m.numero}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                  {m.capacidad} personas
                </div>
                <span className="badge" style={{ background: info.bg, color: info.color }}>{info.label}</span>

                <div style={{ display: 'flex', gap: 4, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {Object.keys(COLORES_ESTADO)
                    .filter((e) => e !== m.estado)
                    .map((e) => (
                      <button
                        key={e}
                        className="btn btn-sm"
                        onClick={() => cambiarEstado(m.id, e)}
                      >
                        {COLORES_ESTADO[e].label}
                      </button>
                    ))}
                </div>
                <button
                  className="btn btn-sm btn-danger"
                  style={{ marginTop: 6, width: '100%' }}
                  onClick={() => eliminar(m.id)}
                >
                  Eliminar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
