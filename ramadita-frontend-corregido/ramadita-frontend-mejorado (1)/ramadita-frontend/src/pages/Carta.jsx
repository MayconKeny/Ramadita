import { useEffect, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIAS_FILTRO = ['Todos', 'Entradas', 'Ceviches', 'Arroces', 'Sopas', 'Segundos', 'Bebidas'];
const CATEGORIAS_FORM = ['Entradas', 'Ceviches', 'Arroces', 'Sopas', 'Segundos', 'Bebidas'];

const PLATO_VACIO = {
  id: null,
  nombre: '',
  precio: '',
  descripcion: '',
  categoria: 'Entradas',
  fotoUrl: '',
  activo: true,
};

/**
 * Reemplaza el bloque #page-carta + funciones loadCarta, renderCarta,
 * filtrarCarta, abrirModalPlato, guardarPlato, eliminarPlato,
 * handleFotoUpload y previewFoto del index.jsp original.
 */
export default function Carta() {
  const [carta, setCarta] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [plato, setPlato] = useState(PLATO_VACIO);
  const showToast = useToast();
  const { usuario } = useAuth();
  // El backend (SecurityConfig) solo deja crear/editar/eliminar platos al
  // rol ADMIN -- MESERO solo tiene lectura (GET). Sin esto, un mesero veia
  // los botones de "+ Nuevo plato"/"Editar"/"Eliminar" pero al hacer clic
  // el backend los rechazaba con 403 sin ningun mensaje claro.
  const puedeEditar = usuario?.rol === 'ADMIN';

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const res = await api.get('/carta');
    setCarta(res.data);
  }

  const lista = filtro === 'Todos' ? carta : carta.filter((p) => p.categoria === filtro);

  function abrirNuevo() {
    setPlato(PLATO_VACIO);
    setModalAbierto(true);
  }

  function abrirEditar(p) {
    setPlato({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      descripcion: p.descripcion || '',
      categoria: p.categoria,
      fotoUrl: p.fotoUrl || '',
      activo: p.activo,
    });
    setModalAbierto(true);
  }

  function handleFotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPlato((prev) => ({ ...prev, fotoUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  async function guardarPlato() {
    if (!plato.nombre.trim() || !plato.precio) {
      alert('Nombre y precio son obligatorios.');
      return;
    }
    try {
      await api.post('/carta', {
        id: plato.id,
        nombre: plato.nombre.trim(),
        descripcion: plato.descripcion,
        precio: Number(plato.precio),
        categoria: plato.categoria,
        fotoUrl: plato.fotoUrl.trim(),
        activo: plato.activo,
      });
      showToast('Plato guardado');
      setModalAbierto(false);
      // Si el filtro activo no coincide con la categoria del plato guardado,
      // el plato se guarda bien pero queda oculto por el filtro -- por eso
      // saltamos directo a "Todos" para garantizar que siempre sea visible.
      setFiltro('Todos');
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  async function eliminarPlato(id) {
    if (!confirm('Eliminar este plato de la carta?')) return;
    try {
      await api.delete(`/carta/${id}`);
      showToast('Plato eliminado');
      cargar();
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || 'desconocido'));
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Gestionar platos de la carta</span>
        {puedeEditar && (
          <button className="btn btn-gold" onClick={abrirNuevo}>+ Nuevo plato</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {CATEGORIAS_FILTRO.map((cat) => (
          <button
            key={cat}
            className="btn btn-sm"
            style={{ fontWeight: filtro === cat ? 600 : 400 }}
            onClick={() => setFiltro(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="carta-grid">
        {lista.length === 0 ? (
          <div className="empty-msg" style={{ gridColumn: '1/-1' }}>No hay platos en esta categoria.</div>
        ) : (
          lista.map((p) => (
            <div className={'plato-card' + (p.activo ? '' : ' inactivo')} key={p.id}>
              {p.fotoUrl ? (
                <img
                  src={p.fotoUrl}
                  alt={p.nombre}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="plato-card-img-placeholder">🍽️</div>
              )}
              <div className="plato-card-body">
                <div className="plato-card-cat">{p.categoria}</div>
                <div className="plato-card-nombre">{p.nombre}</div>
                <div className="plato-card-desc">{p.descripcion || '\u00A0'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="plato-card-precio">S/ {p.precio.toFixed(2)}</div>
                  <span className={`badge badge-${p.activo ? 'ok' : 'inactivo'}`}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {puedeEditar && (
                  <div className="plato-card-actions">
                    <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => abrirEditar(p)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => eliminarPlato(p.id)}>🗑️</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal abierto={modalAbierto}>
        <div className="modal-title">{plato.id ? 'Editar plato' : 'Nuevo plato'}</div>

        <div id="foto-preview-container">
          {plato.fotoUrl ? (
            <img
              className="foto-preview"
              src={plato.fotoUrl}
              alt="preview"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="foto-preview-placeholder">🍽️</div>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Foto del plato</label>
          <div className="upload-area" onClick={() => document.getElementById('foto-file-input').click()}>
            <input type="file" id="foto-file-input" accept="image/*" style={{ display: 'none' }} onChange={handleFotoUpload} />
            <div style={{ fontSize: 22, marginBottom: 4 }}>📷</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>Subir foto desde galeria</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Haz clic o arrastra una imagen</div>
          </div>
          <div style={{ fontSize: 11, color: '#888', margin: '6px 0', textAlign: 'center' }}>— o pega una URL —</div>
          <input
            type="text"
            placeholder="https://... (URL de imagen)"
            style={{ width: '100%' }}
            value={plato.fotoUrl}
            onChange={(e) => setPlato({ ...plato, fotoUrl: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nombre del plato *</label>
            <input
              type="text"
              placeholder="Ej: Ceviche Mixto"
              value={plato.nombre}
              onChange={(e) => setPlato({ ...plato, nombre: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Precio (S/) *</label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.50"
              value={plato.precio}
              onChange={(e) => setPlato({ ...plato, precio: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Descripcion</label>
          <input
            type="text"
            placeholder="Ej: Con leche de tigre, camote y choclo"
            value={plato.descripcion}
            onChange={(e) => setPlato({ ...plato, descripcion: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <select value={plato.categoria} onChange={(e) => setPlato({ ...plato, categoria: e.target.value })}>
              {CATEGORIAS_FORM.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select
              value={plato.activo ? '1' : '0'}
              onChange={(e) => setPlato({ ...plato, activo: e.target.value === '1' })}
            >
              <option value="1">Disponible</option>
              <option value="0">No disponible</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn" onClick={() => setModalAbierto(false)}>Cancelar</button>
          <button className="btn btn-gold" onClick={guardarPlato}>Guardar plato</button>
        </div>
      </Modal>
    </div>
  );
}
