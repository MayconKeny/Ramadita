import { useEffect, useState } from 'react';
import api from '../api/client';
import MenuSelector from '../components/MenuSelector';
import ModalCobro from '../components/ModalCobro';
import ModalBoleta from '../components/ModalBoleta';
import ModalEditarPedido from '../components/ModalEditarPedido';
import { useToast } from '../context/ToastContext';

/**
 * Reemplaza el bloque #page-pedidos completo + toda la logica de:
 * orderItems (carrito), savePedido, loadPedidos, cobrarPedido,
 * confirmarCobro, verBoleta, abrirEditarPedido y sus modales asociados.
 */
export default function Pedidos() {
  const [mesa, setMesa] = useState('');
  const [mesero, setMesero] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [carrito, setCarrito] = useState([]); // [{nombre, precio, cant}]
  const [platosActivos, setPlatosActivos] = useState([]);
  const [pedidosHoy, setPedidosHoy] = useState([]);

  // Estado de los 3 modales
  const [pedidoACobrar, setPedidoACobrar] = useState(null);
  const [boleta, setBoleta] = useState(null); // { pedido, detalles, pagoCon }
  const [pedidoAEditar, setPedidoAEditar] = useState(null); // { id, mesa }

  const showToast = useToast();

  useEffect(() => {
    cargarPedidos();
    cargarMenu();
  }, []);

  async function cargarMenu() {
    const res = await api.get('/carta/activos');
    setPlatosActivos(res.data);
  }

  async function cargarPedidos() {
    const res = await api.get('/pedidos');
    setPedidosHoy(res.data);
  }

  // ---- Carrito ----
  function agregarAlCarrito(nombre, precio) {
    setCarrito((prev) => {
      const existente = prev.find((i) => i.nombre === nombre);
      if (existente) {
        return prev.map((i) => (i.nombre === nombre ? { ...i, cant: i.cant + 1 } : i));
      }
      return [...prev, { nombre, precio, cant: 1 }];
    });
    showToast(nombre + ' agregado');
  }

  function quitarDelCarrito(idx) {
    setCarrito((prev) => prev.filter((_, i) => i !== idx));
  }

  function limpiarPedido() {
    setCarrito([]);
    setMesa('');
    setMesero('');
    setClienteTelefono('');
  }

  const totalCarrito = carrito.reduce((s, i) => s + i.cant * i.precio, 0);

  async function registrarPedido() {
    if (!mesa || carrito.length === 0) {
      alert('Ingresa la mesa y al menos un plato.');
      return;
    }
    try {
      await api.post('/pedidos/registrar', {
        mesa: Number(mesa),
        mesero: mesero || 'Sin nombre',
        clienteTelefono: clienteTelefono.trim() || null,
        items: carrito.map((i) => ({ platoNombre: i.nombre, cantidad: i.cant, precioUnitario: i.precio })),
      });
      showToast('Pedido registrado ✓');
      limpiarPedido();
      cargarPedidos();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  // ---- Cobro ----
  async function confirmarCobro(metodoPago, pagoCon, promocionId) {
    try {
      await api.post(`/pedidos/${pedidoACobrar.id}/cobrar`, { metodoPago, promocionId });
      const pedidoId = pedidoACobrar.id;
      setPedidoACobrar(null);
      showToast('Cobrado con ' + metodoPago + ' ✓');
      await cargarPedidos();
      // Mostrar boleta automaticamente, igual que el original
      abrirBoleta(pedidoId, pagoCon);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  // ---- Boleta ----
  async function abrirBoleta(pedidoId, pagoCon) {
    const [resPedido, resDetalle] = await Promise.all([
      api.get(`/pedidos/${pedidoId}`),
      api.get(`/pedidos/${pedidoId}/detalle`),
    ]);
    setBoleta({ pedido: resPedido.data, detalles: resDetalle.data, pagoCon });
  }

  const totalVentasHoy = pedidosHoy.reduce((s, p) => s + p.total, 0);

  return (
    <>
      <div className="card">
        <div className="card-header"><span className="card-title">Nuevo pedido</span></div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Numero de mesa</label>
            <input type="number" placeholder="Ej: 5" min="1" max="30" value={mesa} onChange={(e) => setMesa(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Mesero</label>
            <input type="text" placeholder="Nombre del mesero" value={mesero} onChange={(e) => setMesero(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Teléfono del cliente (opcional)</label>
            <input type="text" placeholder="Para reconocerlo si vuelve" value={clienteTelefono} onChange={(e) => setClienteTelefono(e.target.value)} />
          </div>
        </div>

        <div id="order-items-list">
          <div className="order-item-row" style={{ fontWeight: 600, fontSize: 12, color: '#888' }}>
            <span>Plato</span><span>Cant.</span><span>Precio</span><span></span>
          </div>
          {carrito.map((item, i) => (
            <div className="order-item-row" key={item.nombre}>
              <span style={{ fontSize: 13 }}>{item.nombre}</span>
              <span>x{item.cant}</span>
              <span>S/ {(item.cant * item.precio).toFixed(2)}</span>
              <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18 }} onClick={() => quitarDelCarrito(i)}>x</button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10, marginBottom: 6 }}>
          <div style={{ fontSize: 12, color: '#666', fontWeight: 500, marginBottom: 6 }}>
            Selecciona un plato del menu (haz clic para agregar):
          </div>
          <MenuSelector platos={platosActivos} onAgregar={agregarAlCarrito} />
        </div>

        <div className="order-total">Total: S/ {totalCarrito.toFixed(2)}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={limpiarPedido}>Limpiar</button>
          <button className="btn btn-gold" onClick={registrarPedido}>Registrar pedido</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Pedidos del dia</span>
          {pedidosHoy.length > 0 && (
            <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>Total: S/ {totalVentasHoy.toFixed(2)}</span>
          )}
        </div>
        <table>
          <thead><tr><th>#</th><th>Mesa</th><th>Mesero</th><th>Hora</th><th>Total</th><th>Estado</th><th>Accion</th></tr></thead>
          <tbody>
            {pedidosHoy.length === 0 ? (
              <tr><td colSpan="7" className="empty-msg">Sin pedidos registrados</td></tr>
            ) : (
              pedidosHoy.map((p) => {
                const hora = p.createdAt ? new Date(p.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-';
                return (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>Mesa {p.mesa}</td>
                    <td>{p.mesero || '-'}</td>
                    <td>{hora}</td>
                    <td>S/ {p.total.toFixed(2)}</td>
                    <td><span className={`badge badge-${p.estado.toLowerCase()}`}>{p.estado}</span></td>
                    <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.estado !== 'Entregado' && (
                        <button className="btn btn-sm" onClick={() => setPedidoAEditar({ id: p.id, mesa: p.mesa })}>✏️ Editar</button>
                      )}
                      <button className="btn btn-sm btn-gold" onClick={() => setPedidoACobrar(p)}>Cobrar</button>
                      <button className="btn btn-sm" onClick={() => abrirBoleta(p.id, null)}>🧾</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ModalCobro
        pedido={pedidoACobrar}
        onCancelar={() => setPedidoACobrar(null)}
        onConfirmar={confirmarCobro}
      />

      <ModalBoleta
        pedido={boleta?.pedido}
        detalles={boleta?.detalles || []}
        pagoCon={boleta?.pagoCon}
        onCerrar={() => setBoleta(null)}
      />

      {pedidoAEditar && (
        <ModalEditarPedido
          pedidoId={pedidoAEditar.id}
          mesa={pedidoAEditar.mesa}
          platosActivos={platosActivos}
          onCerrar={() => setPedidoAEditar(null)}
          onGuardado={() => {
            showToast('Pedido actualizado ✓');
            setPedidoAEditar(null);
            cargarPedidos();
          }}
        />
      )}
    </>
  );
}
