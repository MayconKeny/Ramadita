package com.ramadita.controller;

import com.ramadita.dto.ApiResponse;
import com.ramadita.dto.UsuarioDTO;
import com.ramadita.entity.Usuario;
import com.ramadita.security.UsuarioActual;
import com.ramadita.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Reemplaza a UsuarioServlet.java.
 *   GET                    -> GET /api/usuarios
 *   POST ?accion=guardar   -> POST /api/usuarios
 *   POST ?accion=eliminar  -> DELETE /api/usuarios/{id}
 *
 * Las validaciones (usuario duplicado, no auto-eliminarse, contrasena
 * obligatoria en alta) ya viven en UsuarioService; aqui solo se traduce
 * la excepcion a una respuesta JSON con success:false, igual que el original.
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioActual usuarioActual;

    @GetMapping
    public List<UsuarioDTO> listar() {
        // Importante: nunca se devuelve el hash de la contrasena al frontend.
        return usuarioService.listar().stream().map(UsuarioDTO::desde).toList();
    }

    @PostMapping
    public ApiResponse guardar(@RequestBody Usuario usuario) {
        try {
            usuarioService.guardar(usuario);
            return ApiResponse.ok();
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse eliminar(@PathVariable Integer id) {
        try {
            Integer idLogueado = usuarioActual.obtener().getId();
            usuarioService.eliminar(id, idLogueado);
            return ApiResponse.ok();
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
