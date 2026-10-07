/**
 * Reemplaza el patron .modal-overlay / .modal-overlay.open del original,
 * donde se abria/cerraba el modal agregando/quitando la clase "open".
 * En React simplemente no renderizamos nada si "abierto" es false.
 */
export default function Modal({ abierto, children }) {
  if (!abierto) return null;
  return (
    <div className="modal-overlay open">
      <div className="modal">{children}</div>
    </div>
  );
}
