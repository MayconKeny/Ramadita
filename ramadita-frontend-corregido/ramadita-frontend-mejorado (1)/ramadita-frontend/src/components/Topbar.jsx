/**
 * Reemplaza la topbar de index.jsp, incluyendo el formato de fecha
 * exacto que usaba el JS original (es-PE, dia de semana + fecha larga).
 */
export default function Topbar({ titulo }) {
  const fecha = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="topbar">
      <div className="topbar-title">{titulo}</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="topbar-date">{fecha}</div>
      </div>
    </div>
  );
}
