import { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

const VACIO = { id: null, nombre: '', tipo: 'PORCENTAJE', valor: '', activo: true };

/**
 * Administra los descuentos que el cajero/mesero puede elegir al cobrar
 * un pedido (ver ModalCobro.jsx). Solo las promociones "activo: true"
 * aparecen ahi.
 */
export default function Promociones() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(VACIO);
  const showToast = useToast();

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const res = await api.get('/promociones');
    setPromos(res.data);
  }

  function editar(p) {
    setForm({ id: p.id, nombre: p.nombre, tipo: p.tipo, valor: p.valor, activo: p.activo });
  }

  async function guardar() {
    if (!form.nombre.trim() || !form.valor) {
      alert('Completa nombre y valor del descuento.');
      return;
    }
    try {
      await api.post('/promociones', {
        id: form.id,
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        valor: Number(form.valor),
        activo: form.activo,
      });
      showToast('Promoción guardada');
      setForm(VACIO);
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta promoción?')) return;
    await api.delete(`/promociones/${id}`);
    showToast('Promoción eliminada');
    cargar();
  }

  async function toggleActivo(p) {
    await api.post('/promociones', { ...p, activo: !p.activo });
    cargar();
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="card-title">{form.id ? 'Editar promoción' : 'Nueva promoción'}</span>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input type="text" placeholder="Ej: Happy Hour" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              <option value="PORCENTAJE">Porcentaje (%)</option>
              <option value="MONTO_FIJO">Monto fijo (S/)</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{form.tipo === 'PORCENTAJE' ? 'Porcentaje de descuento' : 'Monto de descuento (S/)'}</label>
            <input type="number" placeholder="0" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {form.id && <button className="btn" onClick={() => setForm(VACIO)}>Cancelar</button>}
              <button className="btn btn-gold" onClick={guardar}>{form.id ? 'Guardar cambios' : 'Crear promoción'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Promociones</span></div>
        <table>
          <thead><tr><th>Nombre</th><th>Descuento</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {promos.length === 0 ? (
              <tr><td colSpan="4" className="empty-msg">No hay promociones creadas</td></tr>
            ) : (
              promos.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.tipo === 'PORCENTAJE' ? `${p.valor}%` : `S/ ${Number(p.valor).toFixed(2)}`}</td>
                  <td>
                    <span className={`badge ${p.activo ? 'badge-ok' : 'badge-inactivo'}`}>
                      {p.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-sm" onClick={() => toggleActivo(p)}>{p.activo ? 'Desactivar' : 'Activar'}</button>
                    <button className="btn btn-sm" onClick={() => editar(p)}>✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => eliminar(p.id)}>Eliminar</button>
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
