package com.ramadita.controller;

import com.ramadita.dto.ApiResponse;
import com.ramadita.entity.Inventario;
import com.ramadita.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Reemplaza a InventarioServlet.java.
 *   GET  ?accion=listar   -> GET /api/inventario
 *   GET  ?accion=alertas  -> GET /api/inventario/alertas
 *   POST ?accion=guardar  -> POST /api/inventario
 *   POST ?accion=eliminar -> DELETE /api/inventario/{id}
 */
@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    public List<Inventario> listar() {
        return inventarioService.listar();
    }

    @GetMapping("/alertas")
    public List<Inventario> alertas() {
        return inventarioService.listarBajoStock();
    }

    @PostMapping
    public ApiResponse guardar(@RequestBody Inventario inventario) {
        inventarioService.guardar(inventario);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse eliminar(@PathVariable Integer id) {
        inventarioService.eliminar(id);
        return ApiResponse.ok();
    }
}
