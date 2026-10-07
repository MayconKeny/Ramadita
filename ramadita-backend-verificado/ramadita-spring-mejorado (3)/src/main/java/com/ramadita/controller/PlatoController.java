package com.ramadita.controller;

import com.ramadita.dto.ApiResponse;
import com.ramadita.entity.Plato;
import com.ramadita.service.PlatoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Reemplaza a CartaServlet.java.
 * Mapeo de acciones:
 *   GET  ?accion=listar   -> GET /api/carta
 *   GET  ?accion=activos  -> GET /api/carta/activos
 *   POST ?accion=guardar  -> POST /api/carta (sin id = crear, con id = actualizar)
 *   POST ?accion=eliminar -> DELETE /api/carta/{id}
 */
@RestController
@RequestMapping("/api/carta")
@RequiredArgsConstructor
public class PlatoController {

    private final PlatoService platoService;

    @GetMapping
    public List<Plato> listar() {
        return platoService.listar();
    }

    @GetMapping("/activos")
    public List<Plato> listarActivos() {
        return platoService.listarActivos();
    }

    @PostMapping
    public ApiResponse guardar(@RequestBody Plato plato) {
        platoService.guardar(plato);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse eliminar(@PathVariable Integer id) {
        platoService.eliminar(id);
        return ApiResponse.ok();
    }
}
