import { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

/**
 * Proveedores + registro de compras. Al registrar una compra, el backend
 * (CompraService.registrar) suma automaticamente esa cantidad al stock
 * del insumo en Inventario -- antes esto se editaba a mano sin dejar
 * ningun rastro de cuando/a quien se le compro ni a que precio.
 */
const PROVEEDOR_VACIO = { id: null, nombre: '', telefono: '', ruc: '', direccion: '', email: '' };

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [compras, setCompras] = useState([]);

  const [formProveedor, setFormProveedor] = useState(PROVEEDOR_VACIO);

  const [compraProveedor, setCompraProveedor] = useState('');
  const [compraInsumoId, setCompraInsumoId] = useState('');
  const [compraCantidad, setCompraCantidad] = useState('');
  const [compraPrecio, setCompraPrecio] = useState('');

  const showToast = useToast();

  useEffect(() => { cargarTodo(); }, []);

  async function cargarTodo() {
    const [resProv, resInv, resCompras] = await Promise.all([
      api.get('/proveedores'),
      api.get('/inventario'),
      api.get('/compras'),
    ]);
    setProveedores(resProv.data);
    setInsumos(resInv.data);
    setCompras(resCompras.data);
  }

  function editarProveedor(p) {
    setFormProveedor({
      id: p.id,
      nombre: p.nombre || '',
      telefono: p.telefono || '',
      ruc: p.ruc || '',
      direccion: p.direccion || '',
      email: p.email || '',
    });
  }

  async function guardarProveedor() {
    if (!formProveedor.nombre.trim()) {
      alert('Ingresa el nombre del proveedor.');
      return;
    }
    try {
      await api.post('/proveedores', {
        id: formProveedor.id,
        nombre: formProveedor.nombre.trim(),
        telefono: formProveedor.telefono.trim(),
        ruc: formProveedor.ruc.trim(),
        direccion: formProveedor.direccion.trim(),
        email: formProveedor.email.trim(),
        activo: true,
      });
      showToast(formProveedor.id ? 'Proveedor actualizado' : 'Proveedor agregado');
      setFormProveedor(PROVEEDOR_VACIO);
      cargarTodo();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  async function eliminarProveedor(id) {
    if (!confirm('¿Eliminar este proveedor?')) return;
    await api.delete(`/proveedores/${id}`);
    showToast('Proveedor eliminado');
    if (formProveedor.id === id) setFormProveedor(PROVEEDOR_VACIO);
    cargarTodo();
  }

  async function registrarCompra() {
    if (!compraProveedor.trim() || !compraInsumoId || !compraCantidad || !compraPrecio) {
      alert('Completa proveedor, insumo, cantidad y precio.');
      return;
    }
    try {
      await api.post('/compras', {
        proveedorNombre: compraProveedor.trim(),
        insumoId: Number(compraInsumoId),
        cantidad: Number(compraCantidad),
        precioUnitario: Number(compraPrecio),
      });
      showToast('Compra registrada y stock actualizado ✓');
      setCompraCantidad('');
      setCompraPrecio('');
      cargarTodo();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  return (
    <>
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <span className="card-title">{formProveedor.id ? 'Editar proveedor' : 'Nuevo proveedor'}</span>
          </div>
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label className="form-label">Nombre / Razón social</label>
            <input type="text" placeholder="Ej: Distribuidora Marina SAC" value={formProveedor.nombre} onChange={(e) => setFormProveedor({ ...formProveedor, nombre: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">RUC</label>
              <input type="text" placeholder="20123456789" maxLength={11} value={formProveedor.ruc} onChange={(e) => setFormProveedor({ ...formProveedor, ruc: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono / contacto</label>
              <input type="text" value={formProveedor.telefono} onChange={(e) => setFormProveedor({ ...formProveedor, telefono: e.target.value })} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label className="form-label">Dirección</label>
            <input type="text" placeholder="Av. Ejemplo 123, Ayacucho" value={formProveedor.direccion} onChange={(e) => setFormProveedor({ ...formProveedor, direccion: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Correo</label>
            <input type="email" placeholder="contacto@proveedor.com" value={formProveedor.email} onChange={(e) => setFormProveedor({ ...formProveedor, email: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {formProveedor.id && (
              <button className="btn" onClick={() => setFormProveedor(PROVEEDOR_VACIO)}>Cancelar</button>
            )}
            <button className="btn btn-gold" onClick={guardarProveedor}>
              {formProveedor.id ? 'Actualizar proveedor' : 'Agregar proveedor'}
            </button>
          </div>

          <table style={{ marginTop: 16 }}>
            <thead><tr><th>Nombre</th><th>RUC</th><th>Contacto</th><th></th></tr></thead>
            <tbody>
              {proveedores.length === 0 ? (
                <tr><td colSpan="4" className="empty-msg">Sin proveedores</td></tr>
              ) : (
                proveedores.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.ruc || '-'}</td>
                    <td>{p.telefono || '-'}</td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm" onClick={() => editarProveedor(p)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => eliminarProveedor(p.id)}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Registrar compra (reabastecer stock)</span></div>
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label className="form-label">Proveedor</label>
            <input type="text" placeholder="Nombre del proveedor" value={compraProveedor} onChange={(e) => setCompraProveedor(e.target.value)} list="lista-proveedores" />
            <datalist id="lista-proveedores">
              {proveedores.map((p) => <option key={p.id} value={p.nombre} />)}
            </datalist>
          </div>
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label className="form-label">Insumo</label>
            <select value={compraInsumoId} onChange={(e) => setCompraInsumoId(e.target.value)}>
              <option value="">Selecciona un insumo...</option>
              {insumos.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre} ({i.unidad}) — stock actual: {i.cantidad}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cantidad comprada</label>
              <input type="number" step="0.1" value={compraCantidad} onChange={(e) => setCompraCantidad(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Precio unitario (S/)</label>
              <input type="number" step="0.01" value={compraPrecio} onChange={(e) => setCompraPrecio(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-gold" onClick={registrarCompra}>Registrar compra</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Historial de compras</span></div>
        <table>
          <thead><tr><th>Fecha</th><th>Proveedor</th><th>Insumo</th><th>Cantidad</th><th>P. Unitario</th><th>Total</th></tr></thead>
          <tbody>
            {compras.length === 0 ? (
              <tr><td colSpan="6" className="empty-msg">Sin compras registradas</td></tr>
            ) : (
              compras.map((c) => (
                <tr key={c.id}>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-PE') : '-'}</td>
                  <td>{c.proveedorNombre}</td>
                  <td>{c.insumoNombre}</td>
                  <td>{c.cantidad}</td>
                  <td>S/ {Number(c.precioUnitario).toFixed(2)}</td>
                  <td>S/ {Number(c.total).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
