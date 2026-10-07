package com.ramadita.controller;

import com.ramadita.dto.ApiResponse;
import com.ramadita.entity.Cliente;
import com.ramadita.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public List<Cliente> listar() {
        return clienteService.listar();
    }

    @PostMapping
    public ApiResponse guardar(@RequestBody Cliente cliente) {
        clienteService.guardar(cliente);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse eliminar(@PathVariable Integer id) {
        clienteService.eliminar(id);
        return ApiResponse.ok();
    }
}
