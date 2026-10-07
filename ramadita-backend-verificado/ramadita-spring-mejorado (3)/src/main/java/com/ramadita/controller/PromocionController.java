package com.ramadita.controller;

import com.ramadita.dto.ApiResponse;
import com.ramadita.entity.Promocion;
import com.ramadita.service.PromocionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promociones")
@RequiredArgsConstructor
public class PromocionController {

    private final PromocionService promocionService;

    @GetMapping
    public List<Promocion> listar() {
        return promocionService.listar();
    }

    @GetMapping("/activas")
    public List<Promocion> listarActivas() {
        return promocionService.listarActivas();
    }

    @PostMapping
    public ApiResponse guardar(@RequestBody Promocion promocion) {
        promocionService.guardar(promocion);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse eliminar(@PathVariable Integer id) {
        promocionService.eliminar(id);
        return ApiResponse.ok();
    }
}
