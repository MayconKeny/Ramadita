package com.ramadita.service;

import com.ramadita.entity.Usuario;
import com.ramadita.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Reemplaza la logica de negocio que estaba en UsuarioServlet + UsuarioDAO.
 *
 * El login en si (verificar usuario/contrasena) ya NO esta aqui:
 * eso lo hace Spring Security automaticamente usando UsuarioDetailsService
 * (Paso 5). Este service se encarga del CRUD de usuarios (alta, edicion,
 * baja, listado) que antes hacia UsuarioServlet.
 */
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    /**
     * Reemplaza UsuarioServlet accion="guardar".
     * Misma validacion del original: no permitir usuario duplicado,
     * y si es nuevo, la contrasena es obligatoria.
     */
    @Transactional
    public Usuario guardar(Usuario datos) {
        boolean esNuevo = datos.getId() == null;

        boolean duplicado = esNuevo
                ? usuarioRepository.existsByUsuario(datos.getUsuario())
                : usuarioRepository.existsByUsuarioAndIdNot(datos.getUsuario(), datos.getId());

        if (duplicado) {
            throw new IllegalArgumentException("El nombre de usuario ya esta en uso.");
        }

        if (esNuevo) {
            if (datos.getContrasena() == null || datos.getContrasena().isBlank()) {
                throw new IllegalArgumentException("La contrasena es obligatoria para nuevo usuario.");
            }
            datos.setContrasena(passwordEncoder.encode(datos.getContrasena()));
            return usuarioRepository.save(datos);
        }

        // Edicion: si no envian contrasena nueva, se mantiene la actual (igual que el original)
        Usuario existente = usuarioRepository.findById(datos.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        existente.setNombre(datos.getNombre());
        existente.setUsuario(datos.getUsuario());
        existente.setRol(datos.getRol());
        existente.setActivo(datos.isActivo());
        if (datos.getContrasena() != null && !datos.getContrasena().isBlank()) {
            existente.setContrasena(passwordEncoder.encode(datos.getContrasena()));
        }
        return usuarioRepository.save(existente);
    }

    /**
     * Reemplaza UsuarioServlet accion="eliminar".
     * Misma proteccion del original: nadie puede eliminar su propio usuario.
     */
    @Transactional
    public void eliminar(Integer id, Integer idUsuarioLogueado) {
        if (id.equals(idUsuarioLogueado)) {
            throw new IllegalArgumentException("No puedes eliminar tu propio usuario.");
        }
        usuarioRepository.deleteById(id);
    }
}
