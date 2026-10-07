import { useState, useEffect } from 'react';
import api from '../api/client';
import Modal from './Modal';
import MenuSelector from './MenuSelector';

/**
 * Reemplaza el #modal-editar-pedido + abrirEditarPedido, addEditItem,
 * editItemCant, removeEditItem, calcEditTotal, guardarEdicionPedido
 * del original.
 */
export default function ModalEditarPedido({ pedidoId, mesa, platosActivos, onCerrar, onGuardado }) {
  const [detallesActuales, setDetallesActuales] = useState([]);
  const [nuevosItems, setNuevosItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (pedidoId) {
      setNuevosItems([]);
      api.get(`/pedidos/${pedidoId}/detalle`).then((res) => {
        setDetallesActuales(res.data);
        setCargando(false);
      });
    }
  }, [pedidoId]);

  if (!pedidoId) return null;

  const totalActual = detallesActuales.reduce((s, d) => s + d.subtotal, 0);
  const totalNuevos = nuevosItems.reduce((s, i) => s + i.cant * i.precio, 0);
  const nuevoTotal = totalActual + totalNuevos;

  function agregarItem(nombre, precio) {
    setNuevosItems((prev) => {
      const existente = prev.find((i) => i.nombre === nombre);
      if (existente) {
        return prev.map((i) => (i.nombre === nombre ? { ...i, cant: i.cant + 1 } : i));
      }
      return [...prev, { nombre, precio, cant: 1 }];
    });
  }

  function cambiarCantidad(idx, delta) {
    setNuevosItems((prev) => {
      const copia = [...prev];
      copia[idx].cant += delta;
      if (copia[idx].cant <= 0) copia.splice(idx, 1);
      return copia;
    });
  }

  function quitarItem(idx) {
    setNuevosItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function guardar() {
    if (!nuevosItems.length) {
      onCerrar();
      return;
    }
    try {
      await api.post(`/pedidos/${pedidoId}/items`, {
        items: nuevosItems.map((i) => ({ platoNombre: i.nombre, cantidad: i.cant, precioUnitario: i.precio })),
      });
      onGuardado();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  return (
    <Modal abierto={true}>
      <div style={{ width: 560 }}>
        <div className="modal-title">✏️ Editar pedido #{pedidoId} — Mesa {mesa}</div>

        <div style={{ fontSize: 12, color: '#666', fontWeight: 500, marginBottom: 6 }}>Platos actuales:</div>
        <div style={{ marginBottom: 14, border: '1px solid #e4e1d6', borderRadius: 8, padding: 8, maxHeight: 160, overflowY: 'auto' }}>
          {cargando ? (
            <div className="empty-msg">Cargando...</div>
          ) : detallesActuales.length === 0 ? (
            <div className="empty-msg">Sin platos</div>
          ) : (
            detallesActuales.map((d) => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px', borderBottom: '1px solid #efece2', fontSize: 13 }}>
                <span>{d.platoNombre}</span>
                <span style={{ color: '#888' }}>x{d.cantidad} &nbsp; S/ {d.subtotal.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        <div style={{ fontSize: 12, color: '#666', fontWeight: 500, marginBottom: 6 }}>Agregar platos extra:</div>
        <div style={{ maxHeight: 200 }}>
          <MenuSelector platos={platosActivos} onAgregar={agregarItem} />
        </div>

        {nuevosItems.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, color: '#13818c', fontWeight: 600, marginBottom: 6 }}>Platos nuevos a agregar:</div>
            {nuevosItems.map((item, i) => (
              <div key={item.nombre} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #efece2', fontSize: 13 }}>
                <span style={{ flex: 1 }}>{item.nombre}</span>
                <button className="btn btn-sm" style={{ padding: '2px 8px' }} onClick={() => cambiarCantidad(i, -1)}>−</button>
                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{item.cant}</span>
                <button className="btn btn-sm" style={{ padding: '2px 8px' }} onClick={() => cambiarCantidad(i, 1)}>+</button>
                <span style={{ minWidth: 60, textAlign: 'right', color: '#888' }}>S/ {(item.cant * item.precio).toFixed(2)}</span>
                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16 }} onClick={() => quitarItem(i)}>×</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #e4e1d6' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Nuevo total: <span style={{ color: '#16302e' }}>S/ {nuevoTotal.toFixed(2)}</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onCerrar}>Cancelar</button>
            <button className="btn btn-gold" onClick={guardar}>✓ Guardar cambios</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
