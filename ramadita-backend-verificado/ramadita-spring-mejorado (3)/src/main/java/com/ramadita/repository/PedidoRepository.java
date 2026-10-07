package com.ramadita.repository;

import com.ramadita.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * Reemplaza a PedidoDAO.java.
 *
 * Mapeo de los metodos originales:
 *  - insertar(p, detalles) -> save(pedido) con pedido.agregarDetalle(...) ya hecho antes
 *    de guardar. El cascade=ALL de la entidad Pedido guarda los detalles automaticamente
 *    (ya no se necesita una transaccion manual con setAutoCommit(false)/commit()/rollback():
 *    Spring envuelve cada metodo @Transactional en una transaccion real).
 *  - listarHoy() -> findByFecha(LocalDate.now())
 *  - listarDetalle(pedidoId) -> ya no se necesita: pedido.getDetalles() los trae solo (relacion JPA).
 *  - agregarItems() -> se hace en el service: se busca el pedido, se le agregan detalles
 *    nuevos con agregarDetalle(), se recalcula el total y se hace save(). Un solo save()
 *    en cascada reemplaza las 2 queries manuales (INSERT detalle + UPDATE total) del original.
 *  - cobrar() / actualizarEstado() -> se hacen en el service modificando la entidad y save().
 *  - getCaja(), ventasPorDia(), platosMasPedidos() -> @Query explicitas, mismo SQL que el original
 *    pero traducido a JPQL (o nativo donde hace falta una funcion especifica de MySQL).
 *  - listarTodos() -> findTop200ByOrderByIdDesc()
 *  - listarPorFecha(fecha) -> findByFecha(fecha)
 *  - listarPorEstado(estado) -> findByEstadoAndFecha(estado, hoy)
 */
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    @Query("SELECT p FROM Pedido p WHERE CAST(p.createdAt AS date) = :fecha ORDER BY p.id DESC")
    List<Pedido> findByFecha(@Param("fecha") LocalDate fecha);

    List<Pedido> findTop200ByOrderByIdDesc();

    @Query("SELECT p FROM Pedido p WHERE p.estado = :estado AND CAST(p.createdAt AS date) = :fecha ORDER BY p.createdAt ASC")
    List<Pedido> findByEstadoAndFecha(@Param("estado") String estado, @Param("fecha") LocalDate fecha);

    // ---- Reportes de caja del dia ----

    @Query("""
        SELECT COALESCE(SUM(CASE WHEN p.estado = 'Entregado' THEN p.total ELSE 0 END), 0)
        FROM Pedido p WHERE CAST(p.createdAt AS date) = :fecha
        """)
    java.math.BigDecimal totalCobradoDelDia(@Param("fecha") LocalDate fecha);

    @Query("""
        SELECT COALESCE(SUM(CASE WHEN p.estado != 'Entregado' THEN p.total ELSE 0 END), 0)
        FROM Pedido p WHERE CAST(p.createdAt AS date) = :fecha
        """)
    java.math.BigDecimal totalPendienteDelDia(@Param("fecha") LocalDate fecha);

    @Query("""
        SELECT COUNT(p) FROM Pedido p
        WHERE p.estado = 'Entregado' AND CAST(p.createdAt AS date) = :fecha
        """)
    long countCobradosDelDia(@Param("fecha") LocalDate fecha);

    List<Pedido> findTop20ByEstadoAndCreatedAtBetweenOrderByIdDesc(
            String estado, java.time.LocalDateTime desde, java.time.LocalDateTime hasta);

    // ---- Usado por Turno: cuanto efectivo se cobro desde que se abrio la caja ----
    @Query("""
        SELECT COALESCE(SUM(p.total), 0) FROM Pedido p
        WHERE p.estado = 'Entregado' AND p.metodoPago = 'Efectivo'
        AND p.createdAt BETWEEN :desde AND :hasta
        """)
    java.math.BigDecimal totalEfectivoEntre(
            @Param("desde") java.time.LocalDateTime desde, @Param("hasta") java.time.LocalDateTime hasta);

    // ---- Reporte: ventas por dia (ultimos 30 dias) ----
    // Usamos query nativa porque DATE() y GROUP BY sobre fecha truncada
    // no se expresan de forma limpia en JPQL puro.
    @Query(value = """
        SELECT DATE(created_at) AS fecha, SUM(total) AS total_ventas, COUNT(*) AS total_pedidos
        FROM pedidos
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY fecha ASC
        """, nativeQuery = true)
    List<Object[]> ventasPorDiaRaw();

    // ---- Reporte: platos mas pedidos (top 10) ----
    @Query(value = """
        SELECT plato_nombre, SUM(cantidad) AS total_cant, SUM(subtotal) AS total_venta
        FROM detalle_pedido
        GROUP BY plato_nombre
        ORDER BY total_cant DESC
        LIMIT 10
        """, nativeQuery = true)
    List<Object[]> platosMasPedidosRaw();
}
