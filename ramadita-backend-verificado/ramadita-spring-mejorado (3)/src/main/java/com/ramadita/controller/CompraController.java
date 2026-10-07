package com.ramadita.controller;

import com.ramadita.dto.ApiResponse;
import com.ramadita.entity.Compra;
import com.ramadita.service.CompraService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @GetMapping
    public List<Compra> listar() {
        return compraService.listar();
    }

    @PostMapping
    public ApiResponse registrar(@RequestBody Map<String, Object> body) {
        String proveedorNombre = (String) body.get("proveedorNombre");
        Integer insumoId = Integer.valueOf(body.get("insumoId").toString());
        double cantidad = Double.parseDouble(body.get("cantidad").toString());
        BigDecimal precioUnitario = new BigDecimal(body.get("precioUnitario").toString());

        compraService.registrar(proveedorNombre, insumoId, cantidad, precioUnitario);
        return ApiResponse.ok();
    }
}
