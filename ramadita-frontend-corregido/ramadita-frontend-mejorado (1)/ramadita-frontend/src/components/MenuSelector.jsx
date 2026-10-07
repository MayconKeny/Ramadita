/**
 * Reemplaza renderMenuSelector()/renderEditMenuGrid() del original.
 * Se reutiliza tanto en "Nuevo pedido" como en el modal "Editar pedido".
 */
export default function MenuSelector({ platos, onAgregar }) {
  if (!platos.length) {
    return (
      <div className="menu-selector-grid">
        <div className="empty-msg" style={{ gridColumn: '1/-1', padding: 16 }}>
          No hay platos en la carta.
        </div>
      </div>
    );
  }

  return (
    <div className="menu-selector-grid">
      {platos.map((p) => (
        <div
          className="menu-item-card"
          key={p.id}
          title="Clic para agregar"
          onClick={() => onAgregar(p.nombre, p.precio)}
        >
          {p.fotoUrl ? (
            <img src={p.fotoUrl} alt={p.nombre} onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="menu-item-placeholder">🍽️</div>
          )}
          <div className="menu-item-info">
            <div className="menu-item-nombre">{p.nombre}</div>
            <div className="menu-item-precio">S/ {p.precio.toFixed(2)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
