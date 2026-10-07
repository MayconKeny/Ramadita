import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Reemplaza login.jsp. Misma idea: formulario de usuario/contrasena,
 * pero ahora la respuesta no es un sendRedirect del servidor sino que
 * React decide a donde navegar segun el resultado.
 *
 * Estilo: hero de puerto/marisqueria a pantalla completa con la tarjeta
 * de acceso flotando encima, en linea con la identidad "Marea" del resto
 * de la app (ver index.css).
 */
export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    const res = await login(usuario, contrasena);
    setCargando(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="login-hero">
      <div className="login-card">
        <div className="login-eyebrow">Marisqueria</div>
        <h1 className="login-title">La Ramadita</h1>
        <p className="login-sub">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              background: '#fdece4', color: '#b4491f', fontSize: 13,
              padding: '9px 11px', borderRadius: 7, marginTop: 14,
            }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-gold"
            style={{ width: '100%', marginTop: 22, padding: '11px 0', fontSize: 14 }}
            type="submit"
            disabled={cargando}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
