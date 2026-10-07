package com.ramadita.controller;

import com.ramadita.dto.ApiResponse;
import com.ramadita.dto.PedidoDTO.*;
import com.ramadita.entity.DetallePedido;
import com.ramadita.entity.Pedido;
import com.ramadita.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Reemplaza a PedidoServlet.java.
 *
 * Mapeo completo de acciones (doGet/doPost con ?accion=...) a endpoints REST:
 *   GET  ?accion=listar            -> GET /api/pedidos
 *   GET  ?accion=historial&fecha=  -> GET /api/pedidos/historial?fecha=
 *   GET  ?accion=ventasPorDia      -> GET /api/pedidos/ventas-por-dia
 *   GET  ?accion=platosMasPedidos  -> GET /api/pedidos/platos-mas-pedidos
 *   GET  ?accion=caja              -> GET /api/pedidos/caja
 *   GET  ?accion=cocina            -> GET /api/pedidos/cocina
 *   GET  ?accion=detalle&id=       -> GET /api/pedidos/{id}/detalle
 *   POST ?accion=registrar         -> POST /api/pedidos/registrar
 *   POST ?accion=agregarItems&id=  -> POST /api/pedidos/{id}/items
 *   POST ?accion=cobrar&id=        -> POST /api/pedidos/{id}/cobrar
 *   POST ?accion=estado&id=        -> POST /api/pedidos/{id}/estado
 */
@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    public List<Pedido> listarHoy() {
        return pedidoService.listarHoy();
    }

    @GetMapping("/historial")
    public List<Pedido> historial(@RequestParam(required = false) String fecha) {
        if (fecha != null && !fecha.isBlank()) {
            return pedidoService.listarPorFecha(LocalDate.parse(fecha));
        }
        return pedidoService.listarTodos();
    }

    @GetMapping("/ventas-por-dia")
    public List<Map<String, Object>> ventasPorDia() {
        return pedidoService.ventasPorDia();
    }

    @GetMapping("/platos-mas-pedidos")
    public List<Map<String, Object>> platosMasPedidos() {
        return pedidoService.platosMasPedidos();
    }

    @GetMapping("/caja")
    public Map<String, Object> caja() {
        return pedidoService.getCaja();
    }

    @GetMapping("/cocina")
    public List<Pedido> cocina() {
        return pedidoService.listarParaCocina();
    }

    @GetMapping("/{id}/detalle")
    public List<DetallePedido> detalle(@PathVariable Integer id) {
        return pedidoService.buscarPorId(id).getDetalles();
    }

    @GetMapping("/{id}")
    public Pedido buscarPorId(@PathVariable Integer id) {
        return pedidoService.buscarPorId(id);
    }

    @PostMapping("/registrar")
    public ApiResponse registrar(@Valid @RequestBody RegistrarRequest req) {
        List<DetallePedido> detalles = req.getItems().stream()
                .map(i -> new DetallePedido(i.getPlatoNombre(), i.getCantidad(), i.getPrecioUnitario()))
                .collect(Collectors.toList());
        Pedido pedido = pedidoService.registrar(req.getMesa(), req.getMesero(), req.getClienteTelefono(), detalles);
        return ApiResponse.ok(Map.of("id", pedido.getId()));
    }

    @PostMapping("/{id}/items")
    public ApiResponse agregarItems(@PathVariable Integer id, @Valid @RequestBody AgregarItemsRequest req) {
        List<DetallePedido> nuevos = req.getItems().stream()
                .map(i -> new DetallePedido(i.getPlatoNombre(), i.getCantidad(), i.getPrecioUnitario()))
                .collect(Collectors.toList());
        pedidoService.agregarItems(id, nuevos);
        return ApiResponse.ok();
    }

    @PostMapping("/{id}/cobrar")
    public ApiResponse cobrar(@PathVariable Integer id, @Valid @RequestBody CobrarRequest req) {
        pedidoService.cobrar(id, req.getMetodoPago(), req.getPromocionId());
        return ApiResponse.ok();
    }

    @PostMapping("/{id}/estado")
    public ApiResponse actualizarEstado(@PathVariable Integer id, @Valid @RequestBody EstadoRequest req) {
        pedidoService.actualizarEstado(id, req.getEstado());
        return ApiResponse.ok();
    }
}
