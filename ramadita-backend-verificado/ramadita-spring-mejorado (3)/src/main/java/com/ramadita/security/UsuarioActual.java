package com.ramadita.security;

import com.ramadita.entity.Usuario;
import com.ramadita.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Reemplaza las llamadas a session.getAttribute("usuarioLogueado") que se
 * usaban en los Servlets originales (por ejemplo, en UsuarioServlet para
 * impedir que un usuario se elimine a si mismo).
 */
@Component
@RequiredArgsConstructor
public class UsuarioActual {

    private final UsuarioRepository usuarioRepository;

    public Usuario obtener() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new IllegalStateException("Usuario autenticado no encontrado en BD"));
    }
}
