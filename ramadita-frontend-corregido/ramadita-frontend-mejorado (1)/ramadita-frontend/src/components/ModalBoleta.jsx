import Modal from './Modal';

/**
 * Reemplaza el #modal-boleta + verBoleta()/imprimirBoleta() del original.
 * pedido: el objeto Pedido completo. detalles: lista de DetallePedido.
 * pagoCon: monto con el que pagó (solo se muestra vuelto si fue en efectivo).
 */
export default function ModalBoleta({ pedido, detalles, pagoCon, onCerrar }) {
  if (!pedido) return null;

  const dt = pedido.createdAt ? new Date(pedido.createdAt) : new Date();
  const fecha = dt.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    + ' ' + dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const mostrarVuelto = pagoCon && pagoCon > 0 && (pedido.metodoPago === 'Efectivo' || !pedido.metodoPago);

  return (
    <Modal abierto={true}>
      <div style={{ width: 380 }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>🧾 Boleta del pedido</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-gold" onClick={() => window.print()}>🖨️ Imprimir / PDF</button>
            <button className="btn" onClick={onCerrar}>Cerrar</button>
          </div>
        </div>

        <div id="boleta-print">
          <div className="boleta-wrap">
            <div className="boleta-titulo">LA RAMADITA</div>
            <div className="boleta-sub">Marisqueria</div>
            <div className="boleta-sub">{fecha}</div>
            <div className="boleta-linea"></div>
            <div className="boleta-row"><span>Pedido:</span><span>#{pedido.id}</span></div>
            <div className="boleta-row"><span>Mesa:</span><span>Mesa {pedido.mesa}</span></div>
            <div className="boleta-row"><span>Mesero:</span><span>{pedido.mesero || '-'}</span></div>
            <div className="boleta-row"><span>Pago:</span><span>{pedido.metodoPago || 'Efectivo'}</span></div>
            <div className="boleta-linea"></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 11, marginBottom: 4 }}>
              <span style={{ flex: 2 }}>Plato</span>
              <span style={{ flex: 0.5, textAlign: 'center' }}>Cant</span>
              <span style={{ flex: 1, textAlign: 'right' }}>Subtotal</span>
            </div>
            <div>
              {detalles.map((d) => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0', fontSize: 12 }}>
                  <span style={{ flex: 2 }}>{d.platoNombre}</span>
                  <span style={{ flex: 0.5, textAlign: 'center' }}>x{d.cantidad}</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>S/ {d.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="boleta-linea"></div>
            <div className="boleta-total"><span>TOTAL</span><span>S/ {pedido.total.toFixed(2)}</span></div>
            {mostrarVuelto && (
              <div>
                <div className="boleta-row"><span>Recibido:</span><span>S/ {parseFloat(pagoCon).toFixed(2)}</span></div>
                <div className="boleta-row" style={{ fontWeight: 600 }}>
                  <span>Vuelto:</span><span>S/ {(pagoCon - pedido.total).toFixed(2)}</span>
                </div>
              </div>
            )}
            <div className="boleta-linea"></div>
            <div className="boleta-pie">¡Gracias por su visita!</div>
            <div className="boleta-pie">Vuelva pronto 🦐</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
