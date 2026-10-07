import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Reemplaza showToast() del JS original, que mostraba un mensaje
 * temporal en pantalla (2.5 segundos) tras cada accion exitosa.
 */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [mensaje, setMensaje] = useState('');
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setMensaje(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 2500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div id="toast" className={visible ? 'toast show' : 'toast'}>{mensaje}</div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
