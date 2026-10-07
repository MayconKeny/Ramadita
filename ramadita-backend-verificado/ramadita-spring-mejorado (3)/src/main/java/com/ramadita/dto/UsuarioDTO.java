package com.ramadita.dto;

import com.ramadita.entity.Usuario;

/**
 * Reemplaza enviar la entidad Usuario completa al frontend.
 * Nunca se expone el hash BCrypt de la contrasena hacia afuera del backend.
 */
public record UsuarioDTO(Integer id, String nombre, String usuario, String rol, boolean activo) {

    public static UsuarioDTO desde(Usuario u) {
        return new UsuarioDTO(u.getId(), u.getNombre(), u.getUsuario(), u.getRol().name(), u.isActivo());
    }
}
