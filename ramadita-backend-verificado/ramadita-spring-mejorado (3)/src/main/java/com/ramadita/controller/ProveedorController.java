package com.ramadita.controller;

import com.ramadita.dto.ApiResponse;
import com.ramadita.entity.Proveedor;
import com.ramadita.service.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @GetMapping
    public List<Proveedor> listar() {
        return proveedorService.listar();
    }

    @PostMapping
    public ApiResponse guardar(@RequestBody Proveedor proveedor) {
        proveedorService.guardar(proveedor);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse eliminar(@PathVariable Integer id) {
        proveedorService.eliminar(id);
        return ApiResponse.ok();
    }
}
