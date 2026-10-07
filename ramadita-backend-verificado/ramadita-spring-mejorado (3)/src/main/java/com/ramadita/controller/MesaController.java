package com.ramadita.controller;

import com.ramadita.dto.ApiResponse;
import com.ramadita.entity.Mesa;
import com.ramadita.service.MesaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mesas")
@RequiredArgsConstructor
public class MesaController {

    private final MesaService mesaService;

    @GetMapping
    public List<Mesa> listar() {
        return mesaService.listar();
    }

    @PostMapping
    public ApiResponse guardar(@RequestBody Mesa mesa) {
        mesaService.guardar(mesa);
        return ApiResponse.ok();
    }

    @PostMapping("/{id}/estado")
    public ApiResponse cambiarEstado(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        mesaService.cambiarEstado(id, body.get("estado"));
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse eliminar(@PathVariable Integer id) {
        mesaService.eliminar(id);
        return ApiResponse.ok();
    }
}
