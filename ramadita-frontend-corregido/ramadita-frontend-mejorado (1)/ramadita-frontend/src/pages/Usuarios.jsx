import { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// Mismos colores que el objeto ROL_BADGE del original, agregando CAJERO
// que faltaba ahi (era soportado por el backend pero nunca se podia crear).
const ROL_BADGE_STYLE = {
  ADMIN: { background: '#fef9c3', color: '#854d0e' },
  MESERO: { background: '#dbeafe', color: '#1e40af' },
  COCINA: { background: '#dcfce7', color: '#15803d' },
  CAJERO: { background: '#f3e8ff', color: '#7e22ce' },
};

const USUARIO_VACIO = { id: null, nombre: '', usuario: '', contrasena: '', rol: 'MESERO', activo: true };

/**
 * Reemplaza el bloque #page-usuarios + loadUsuarios/abrirModalUsuario/
 * guardarUsuario/eliminarUsuario del original.
 */
export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(USUARIO_VACIO);
  const showToast = useToast();
  const { usuario: usuarioActual } = useAuth();

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const res = await api.get('/usuarios');
    setUsuarios(res.data);
  }

  function abrirNuevo() {
    setForm(USUARIO_VACIO);
    setModalAbierto(true);
  }

  function abrirEditar(u) {
    setForm({ id: u.id, nombre: u.nombre, usuario: u.usuario, contrasena: '', rol: u.rol, activo: u.activo });
    setModalAbierto(true);
  }

  async function guardar() {
    if (!form.nombre.trim() || !form.usuario.trim()) {
      alert('Nombre y usuario son obligatorios.');
      return;
    }
    if (!form.id && !form.contrasena) {
      alert('La contraseña es obligatoria para un nuevo usuario.');
      return;
    }
    try {
      await api.post('/usuarios', {
        id: form.id,
        nombre: form.nombre.trim(),
        usuario: form.usuario.trim(),
        contrasena: form.contrasena || null,
        rol: form.rol,
        activo: form.activo,
      });
      showToast('Usuario guardado correctamente');
      setModalAbierto(false);
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      showToast('Usuario eliminado');
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'No se pudo eliminar'));
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">👥 Gestión de Usuarios</span>
        <button className="btn btn-gold" onClick={abrirNuevo}>+ Nuevo usuario</button>
      </div>
      <table>
        <thead><tr><th>#</th><th>Nombre completo</th><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr><td colSpan="6" className="empty-msg">No hay usuarios registrados.</td></tr>
          ) : (
            usuarios.map((u) => (
              <tr key={u.id}>
                <td style={{ color: '#888', fontSize: 12 }}>#{u.id}</td>
                <td style={{ fontWeight: 500 }}>{u.nombre}</td>
                <td style={{ color: '#555', fontFamily: 'monospace' }}>{u.usuario}</td>
                <td>
                  <span className="badge" style={ROL_BADGE_STYLE[u.rol] || {}}>
                    {u.rol.charAt(0) + u.rol.slice(1).toLowerCase()}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${u.activo ? 'ok' : 'entregado'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" onClick={() => abrirEditar(u)}>Editar</button>
                    {u.id !== usuarioActual.id && (
                      <button className="btn btn-sm btn-danger" onClick={() => eliminar(u.id)}>🗑️</button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Modal abierto={modalAbierto}>
        <div style={{ maxWidth: 440 }}>
          <div className="modal-title">{form.id ? 'Editar usuario' : 'Nuevo usuario'}</div>

          <div className="form-row" style={{ marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">Nombre completo *</label>
              <input
                type="text" placeholder="Ej: Juan Pérez"
                value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre de usuario *</label>
              <input
                type="text" placeholder="Ej: jperez" autoComplete="off"
                value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Contraseña <span style={{ color: '#aaa', fontWeight: 400 }}>
                  {form.id ? '(dejar vacío para no cambiar)' : '(obligatoria)'}
                </span>
              </label>
              <input
                type="password" placeholder="Contraseña" autoComplete="new-password"
                value={form.contrasena} onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rol *</label>
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                <option value="ADMIN">Admin</option>
                <option value="MESERO">Mesero</option>
                <option value="COCINA">Cocina</option>
                <option value="CAJERO">Cajero</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Estado</label>
            <select value={form.activo ? '1' : '0'} onChange={(e) => setForm({ ...form, activo: e.target.value === '1' })}>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button className="btn btn-gold" onClick={guardar}>Guardar usuario</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
