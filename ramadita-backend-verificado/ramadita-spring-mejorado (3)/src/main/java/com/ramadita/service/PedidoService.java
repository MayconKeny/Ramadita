package com.ramadita.service;

import com.ramadita.entity.DetallePedido;
import com.ramadita.entity.Pedido;
import com.ramadita.repository.PedidoRepository;
import com.ramadita.websocket.CocinaWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Reemplaza la logica de negocio de PedidoServlet.java + PedidoDAO.java.
 * Es el service mas grande porque concentra pedidos, cocina, caja y reportes,
 * igual que en el proyecto original.
 */
@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final MesaService mesaService;
    private final CocinaWebSocketHandler cocinaWebSocketHandler;
    private final PromocionService promocionService;
    private final ClienteService clienteService;

    // ---------------------------------------------------------------
    // Registrar pedido nuevo (reemplaza accion="registrar")
    // ---------------------------------------------------------------
    @Transactional
    public Pedido registrar(int mesa, String mesero, String clienteTelefono, List<DetallePedido> detalles) {
        // No se puede abrir un pedido nuevo sobre una mesa que ya tiene
        // uno activo -- antes esto no se validaba y se podian crear
        // pedidos duplicados sobre la misma mesa sin que nadie se diera
        // cuenta, ya que el mapa de Mesas mostraba "Ocupada" pero el
        // formulario de Pedidos lo dejaba pasar igual.
        if (mesaService.estaOcupada(mesa)) {
            throw new IllegalStateException("La mesa " + mesa + " ya tiene un pedido activo. Cóbralo o libera la mesa antes de registrar uno nuevo.");
        }

        Pedido pedido = new Pedido();
        pedido.setMesa(mesa);
        pedido.setMesero(mesero);
        pedido.setEstado("Pendiente");
        pedido.setClienteTelefono(clienteTelefono);

        BigDecimal total = BigDecimal.ZERO;
        for (DetallePedido d : detalles) {
            pedido.agregarDetalle(d);
            total = total.add(d.getSubtotal());
        }
        pedido.setTotal(total);

        // Gracias al cascade=ALL en Pedido.detalles, un solo save() guarda
        // el pedido Y sus detalles. Reemplaza la transaccion manual con
        // INSERT pedido + INSERT batch detalle del DAO original.
        Pedido guardado = pedidoRepository.save(pedido);

        mesaService.marcarOcupadaPorNumero(mesa);
        cocinaWebSocketHandler.avisar("pedido-nuevo");

        return guardado;
    }

    // ---------------------------------------------------------------
    // Agregar items a un pedido existente (reemplaza accion="agregarItems")
    // ---------------------------------------------------------------
    @Transactional
    public Pedido agregarItems(Integer pedidoId, List<DetallePedido> nuevos) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado: " + pedidoId));

        // Un pedido ya cobrado no puede recibir mas platos por esta via --
        // antes se podia seguir agregando items despues de "Entregado" sin
        // que esos platos extra se llegaran a cobrar nunca.
        if ("Entregado".equals(pedido.getEstado())) {
            throw new IllegalStateException("Este pedido ya fue cobrado, no se le pueden agregar mas platos.");
        }

        for (DetallePedido d : nuevos) {
            pedido.agregarDetalle(d);
        }

        // Recalcular total sumando todos los detalles (igual que el
        // sqlTotal del original: UPDATE pedidos SET total = (SELECT SUM...))
        BigDecimal nuevoTotal = pedido.getDetalles().stream()
                .map(DetallePedido::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        pedido.setTotal(nuevoTotal);

        return pedidoRepository.save(pedido);
    }

    // ---------------------------------------------------------------
    // Cobrar (reemplaza accion="cobrar")
    // ---------------------------------------------------------------
    @Transactional
    public Pedido cobrar(Integer id, String metodoPago, Integer promocionId) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado: " + id));

        // Sin este bloqueo, cobrar dos veces el mismo pedido volvia a aplicar
        // el descuento sobre un total ya descontado (doble descuento) y
        // sumaba dos visitas al mismo cliente por un solo pedido real.
        if ("Entregado".equals(pedido.getEstado())) {
            throw new IllegalStateException("Este pedido ya fue cobrado anteriormente.");
        }

        if (promocionId != null) {
            var promo = promocionService.listarActivas().stream()
                    .filter(p -> p.getId().equals(promocionId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Promocion no encontrada o inactiva"));
            BigDecimal descuento = promocionService.calcularDescuento(promo, pedido.getTotal());
            pedido.setDescuentoMonto(descuento);
            pedido.setPromocionNombre(promo.getNombre());
            pedido.setTotal(pedido.getTotal().subtract(descuento));
        }

        pedido.setEstado("Entregado");
        pedido.setMetodoPago(metodoPago);
        Pedido guardado = pedidoRepository.save(pedido);

        mesaService.marcarLibrePorNumero(pedido.getMesa());
        clienteService.registrarVisita(pedido.getClienteTelefono(), null);

        return guardado;
    }

    // ---------------------------------------------------------------
    // Cambiar estado (reemplaza accion="estado", usado por cocina)
    // ---------------------------------------------------------------
    // Estados que Cocina puede asignar por esta via. "Entregado" queda
    // deliberadamente fuera: ese estado solo debe salir de cobrar(), que
    // ademas libera la mesa, guarda el metodo de pago y registra la
    // visita del cliente. Si se permitia aqui, un pedido podia terminar
    // marcado "Entregado" sin nada de eso -- la mesa quedaba Ocupada
    // para siempre y esa venta jamas se contaba en Caja.
    private static final java.util.Set<String> ESTADOS_COCINA_PERMITIDOS =
            java.util.Set.of("Pendiente", "Preparando", "Listo");

    @Transactional
    public Pedido actualizarEstado(Integer id, String estado) {
        if (!ESTADOS_COCINA_PERMITIDOS.contains(estado)) {
            throw new IllegalArgumentException(
                    "Estado invalido: " + estado + ". Usa Pendiente, Preparando o Listo (el cobro se hace desde Cobrar, no desde aqui).");
        }

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado: " + id));
        pedido.setEstado(estado);
        Pedido guardado = pedidoRepository.save(pedido);
        cocinaWebSocketHandler.avisar("pedido-actualizado");
        return guardado;
    }

    // ---------------------------------------------------------------
    // Listados (reemplazan listarHoy, listarTodos, listarPorFecha)
    // ---------------------------------------------------------------
    public List<Pedido> listarHoy() {
        return pedidoRepository.findByFecha(LocalDate.now());
    }

    public List<Pedido> listarTodos() {
        return pedidoRepository.findTop200ByOrderByIdDesc();
    }

    public List<Pedido> listarPorFecha(LocalDate fecha) {
        return pedidoRepository.findByFecha(fecha);
    }

    /** Reemplaza accion="detalle": ya no hace falta, basta con pedido.getDetalles(). */
    public Pedido buscarPorId(Integer id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado: " + id));
    }

    /**
     * Reemplaza accion="cocina": pedidos Pendiente + Preparando del dia,
     * con sus detalles. Antes esto necesitaba un bucle llamando
     * dao.listarDetalle(p.getId()) por cada pedido; ahora JPA los trae solos.
     */
    public List<Pedido> listarParaCocina() {
        List<Pedido> pendientes = pedidoRepository.findByEstadoAndFecha("Pendiente", LocalDate.now());
        List<Pedido> preparando = pedidoRepository.findByEstadoAndFecha("Preparando", LocalDate.now());
        pendientes.addAll(preparando);
        return pendientes;
    }

    // ---------------------------------------------------------------
    // Caja del dia (reemplaza accion="caja" / dao.getCaja())
    // ---------------------------------------------------------------
    public Map<String, Object> getCaja() {
        LocalDate hoy = LocalDate.now();
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("totalCobrado", pedidoRepository.totalCobradoDelDia(hoy));
        result.put("totalPendiente", pedidoRepository.totalPendienteDelDia(hoy));
        result.put("pedidosCobrados", pedidoRepository.countCobradosDelDia(hoy));

        // Por metodo de pago: en el original solo consideraba "Efectivo" fijo;
        // aqui lo calculamos agrupando por el campo metodoPago real ya guardado.
        LocalDateTime inicioDia = hoy.atStartOfDay();
        LocalDateTime finDia = hoy.plusDays(1).atStartOfDay();
        List<Pedido> cobrosHoy = pedidoRepository
                .findTop20ByEstadoAndCreatedAtBetweenOrderByIdDesc("Entregado", inicioDia, finDia);

        Map<String, BigDecimal> porMetodo = new LinkedHashMap<>();
        for (Pedido p : cobrosHoy) {
            String metodo = p.getMetodoPago() != null ? p.getMetodoPago() : "Efectivo";
            porMetodo.merge(metodo, p.getTotal(), BigDecimal::add);
        }
        result.put("porMetodo", porMetodo);
        result.put("cobros", cobrosHoy);

        return result;
    }

    // ---------------------------------------------------------------
    // Reportes (reemplazan ventasPorDia y platosMasPedidos)
    // ---------------------------------------------------------------
    public List<Map<String, Object>> ventasPorDia() {
        List<Object[]> filas = pedidoRepository.ventasPorDiaRaw();
        return filas.stream().map(fila -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("fecha", fila[0].toString());
            row.put("totalVentas", fila[1]);
            row.put("totalPedidos", fila[2]);
            return row;
        }).toList();
    }

    public List<Map<String, Object>> platosMasPedidos() {
        List<Object[]> filas = pedidoRepository.platosMasPedidosRaw();
        return filas.stream().map(fila -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("nombre", fila[0]);
            row.put("cantidad", fila[1]);
            row.put("totalVenta", fila[2]);
            return row;
        }).toList();
    }
}
