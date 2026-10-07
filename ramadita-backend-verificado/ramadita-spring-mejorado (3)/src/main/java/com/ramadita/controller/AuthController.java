package com.ramadita.controller;

import com.ramadita.security.UsuarioActual;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Endpoint nuevo que no existia en el proyecto original (porque el JSP
 * obtenia el usuario directo de la sesion del servidor al renderizar).
 * Como ahora el frontend es una SPA separada (React), necesita una forma
 * de preguntarle al backend "quien esta logueado ahora" al cargar o
 * recargar la pagina, ya que la cookie de sesion vive en el navegador
 * pero React no tiene acceso directo a ella.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioActual usuarioActual;

    @GetMapping("/me")
    public Map<String, Object> me() {
        var usuario = usuarioActual.obtener();
        return Map.of(
                "id", usuario.getId(),
                "usuario", usuario.getUsuario(),
                "nombre", usuario.getNombre(),
                "rol", usuario.getRol().name()
        );
    }
}
