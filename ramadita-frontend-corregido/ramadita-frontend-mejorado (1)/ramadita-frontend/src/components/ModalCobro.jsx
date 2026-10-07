import { useState, useEffect } from 'react';
import api from '../api/client';
import Modal from './Modal';

/**
 * Reemplaza el #modal-cobro + funciones cobrarPedido, selPago, calcVuelto,
 * confirmarCobro del original. Misma logica de "billetes rapidos" sugeridos
 * segun el total a cobrar.
 *
 * Nuevo: selector opcional de promocion/descuento activo, que recalcula
 * el total a cobrar y el vuelto en vivo antes de confirmar.
 */
export default function ModalCobro({ pedido, onCancelar, onConfirmar }) {
  const [metodo, setMetodo] = useState('Efectivo');
  const [pagoCon, setPagoCon] = useState('');
  const [promociones, setPromociones] = useState([]);
  const [promocionId, setPromocionId] = useState('');

  useEffect(() => {
    if (pedido) {
      setMetodo('Efectivo');
      setPagoCon('');
      setPromocionId('');
      api.get('/promociones/activas').then((res) => setPromociones(res.data)).catch(() => setPromociones([]));
    }
  }, [pedido]);

  if (!pedido) return null;

  const totalOriginal = parseFloat(pedido.total);
  const promo = promociones.find((p) => String(p.id) === String(promocionId));
  const descuento = promo
    ? Math.min(promo.tipo === 'PORCENTAJE' ? totalOriginal * (promo.valor / 100) : promo.valor, totalOriginal)
    : 0;
  const total = totalOriginal - descuento;
  const con = parseFloat(pagoCon) || 0;
  const vuelto = con - total;

  // Mismos billetes sugeridos que el original: redondea hacia arriba y
  // ofrece denominaciones comunes (10, 20, 50, 100, 200) >= al total.
  const totalRedondeado = Math.ceil(total);
  const billetes = [10, 20, 50, 100, 200];
  let rapidos = billetes.filter((b) => b >= totalRedondeado).slice(0, 4);
  if (rapidos.length === 0) rapidos = [totalRedondeado, totalRedondeado + 10, totalRedondeado + 50];

  function confirmar() {
    if (metodo === 'Efectivo' && con < total) {
      alert('El monto ingresado es menor al total.');
      return;
    }
    onConfirmar(metodo, con, promocionId ? Number(promocionId) : null);
  }

  return (
    <Modal abierto={true}>
      <div className="modal-title">💳 Cobrar pedido #{pedido.id}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Mesa {pedido.mesa}</div>

      {promociones.length > 0 && (
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Promoción / descuento (opcional)</label>
          <select value={promocionId} onChange={(e) => setPromocionId(e.target.value)}>
            <option value="">Sin descuento</option>
            {promociones.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.tipo === 'PORCENTAJE' ? `-${p.valor}%` : `-S/ ${p.valor}`})
              </option>
            ))}
          </select>
        </div>
      )}

      {descuento > 0 ? (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'line-through' }}>S/ {totalOriginal.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: '#e2693f', fontWeight: 600 }}>Descuento: -S/ {descuento.toFixed(2)}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Total: S/ {total.toFixed(2)}</div>
        </div>
      ) : (
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Total: S/ {total.toFixed(2)}</div>
      )}

      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 8 }}>Metodo de pago:</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['Efectivo', 'Yape', 'Tarjeta'].map((m) => (
          <button
            key={m}
            className={'pago-btn' + (metodo === m ? ' selected' : '')}
            onClick={() => setMetodo(m)}
          >
            {m === 'Efectivo' ? '💵 Efectivo' : m === 'Yape' ? '📱 Yape/Plin' : '💳 Tarjeta'}
          </button>
        ))}
      </div>

      {metodo === 'Efectivo' && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>
            ¿Con cuanto paga el cliente?
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="number"
              placeholder="S/ 0.00"
              min="0"
              step="1"
              style={{ flex: 1, padding: 10, border: '1px solid var(--line)', borderRadius: 7, fontSize: 16 }}
              value={pagoCon}
              onChange={(e) => setPagoCon(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {rapidos.map((b) => (
              <button key={b} className="btn btn-sm" onClick={() => setPagoCon(String(b))}>
                S/ {b}
              </button>
            ))}
          </div>
          {con > 0 && (
            <div className="vuelto-box" style={{ display: 'block' }}>
              <div style={{ fontSize: 12, color: '#16a34a', marginBottom: 4 }}>VUELTO</div>
              <div className="vuelto-monto">S/ {vuelto.toFixed(2)}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <button className="btn" onClick={onCancelar}>Cancelar</button>
        <button className="btn btn-gold" onClick={confirmar}>✓ Confirmar cobro</button>
      </div>
    </Modal>
  );
}
