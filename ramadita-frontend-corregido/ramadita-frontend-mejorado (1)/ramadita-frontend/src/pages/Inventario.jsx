import { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

const CATEGORIAS = ['Mariscos', 'Pescado', 'Insumos', 'Bebidas', 'Otros'];
const UNIDADES = ['kg', 'unidades', 'litros', 'bolsas'];

const PRODUCTO_VACIO = { id: null, nombre: '', categoria: 'Mariscos', cantidad: '', unidad: 'kg', stockMinimo: '' };

/**
 * Reemplaza el bloque #page-inventario + loadInventario/saveInventario/
 * eliminarInv del original. A diferencia de Carta/Usuarios, aqui el
 * formulario es fijo en la parte superior (no un modal), igual que en
 * el JSP original.
 */
export default function Inventario() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(PRODUCTO_VACIO);
  const showToast = useToast();

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const res = await api.get('/inventario');
    setItems(res.data);
  }

  function editar(item) {
    setForm({
      id: item.id,
      nombre: item.nombre,
      categoria: item.categoria,
      cantidad: item.cantidad,
      unidad: item.unidad,
      stockMinimo: item.stockMinimo,
    });
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      alert('Ingresa el nombre del producto.');
      return;
    }
    try {
      await api.post('/inventario', {
        id: form.id,
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        cantidad: Number(form.cantidad) || 0,
        unidad: form.unidad,
        stockMinimo: Number(form.stockMinimo) || 0,
      });
      showToast('Producto guardado');
      setForm(PRODUCTO_VACIO);
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  async function eliminar(id) {
    if (!confirm('Eliminar este producto?')) return;
    try {
      await api.delete(`/inventario/${id}`);
      showToast('Producto eliminado');
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  const bajoStock = items.filter((i) => i.cantidad <= i.stockMinimo).length;

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="card-title">{form.id ? 'Editar producto' : 'Agregar / actualizar producto'}</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nombre del producto</label>
            <input
              type="text"
              placeholder="Ej: Camarones frescos"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Cantidad actual</label>
            <input
              type="number" placeholder="0" min="0" step="0.1"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Unidad</label>
            <select value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}>
              {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stock minimo</label>
            <input
              type="number" placeholder="0" min="0" step="0.1"
              value={form.stockMinimo}
              onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {form.id && (
                <button className="btn" onClick={() => setForm(PRODUCTO_VACIO)}>Cancelar</button>
              )}
              <button className="btn btn-gold" onClick={guardar}>
                {form.id ? 'Actualizar producto' : 'Guardar producto'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Stock actual</span>
          <span style={{ fontSize: 13, color: '#888' }}>{items.length} productos, {bajoStock} en alerta</span>
        </div>
        <table>
          <thead><tr><th>Producto</th><th>Categoria</th><th>Cantidad</th><th>Minimo</th><th>Estado</th><th>Accion</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="empty-msg">Sin productos</td></tr>
            ) : (
              items.map((item) => {
                const bajo = item.cantidad <= item.stockMinimo;
                return (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td>{item.categoria}</td>
                    <td>{item.cantidad} {item.unidad}</td>
                    <td>{item.stockMinimo} {item.unidad}</td>
                    <td><span className={`badge badge-${bajo ? 'bajo' : 'ok'}`}>{bajo ? 'Stock bajo' : 'OK'}</span></td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm" onClick={() => editar(item)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => eliminar(item.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
