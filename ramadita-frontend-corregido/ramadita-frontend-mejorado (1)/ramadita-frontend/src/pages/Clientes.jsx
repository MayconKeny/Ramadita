import { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

const VACIO = { id: null, nombre: '', telefono: '' };

/**
 * Clientes frecuentes. Las "visitas" y "ultima visita" se actualizan
 * solas cuando se cobra un pedido que trae el mismo telefono (ver
 * ClienteService.registrarVisita en el backend) -- aca el admin solo
 * completa el nombre real o corrige datos a mano si hace falta.
 */
export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [busqueda, setBusqueda] = useState('');
  const showToast = useToast();

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const res = await api.get('/clientes');
    setClientes(res.data);
  }

  function editar(c) {
    setForm({ id: c.id, nombre: c.nombre, telefono: c.telefono });
  }

  async function guardar() {
    if (!form.nombre.trim() || !form.telefono.trim()) {
      alert('Completa nombre y teléfono.');
      return;
    }
    try {
      await api.post('/clientes', { id: form.id, nombre: form.nombre.trim(), telefono: form.telefono.trim() });
      showToast('Cliente guardado');
      setForm(VACIO);
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'ya existe un cliente con ese teléfono'));
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    await api.delete(`/clientes/${id}`);
    showToast('Cliente eliminado');
    cargar();
  }

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.telefono.includes(busqueda)
  );

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="card-title">{form.id ? 'Editar cliente' : 'Agregar cliente'}</span>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input type="text" placeholder="Nombre del cliente" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input type="text" placeholder="Ej: 966123456" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {form.id && <button className="btn" onClick={() => setForm(VACIO)}>Cancelar</button>}
          <button className="btn btn-gold" onClick={guardar}>{form.id ? 'Guardar cambios' : 'Agregar cliente'}</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Clientes frecuentes</span>
          <input
            type="text" placeholder="Buscar por nombre o teléfono..."
            style={{ maxWidth: 220 }}
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <table>
          <thead><tr><th>Nombre</th><th>Teléfono</th><th>Visitas</th><th>Última visita</th><th></th></tr></thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan="5" className="empty-msg">Sin clientes registrados</td></tr>
            ) : (
              filtrados.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.telefono}</td>
                  <td>
                    <span className="badge" style={{ background: c.visitas >= 5 ? '#dcfce7' : '#f1efe6', color: c.visitas >= 5 ? '#15803d' : 'var(--muted)' }}>
                      {c.visitas} {c.visitas === 1 ? 'visita' : 'visitas'}
                    </span>
                  </td>
                  <td>{c.ultimaVisita ? new Date(c.ultimaVisita).toLocaleDateString('es-PE') : '-'}</td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-sm" onClick={() => editar(c)}>✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => eliminar(c.id)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
