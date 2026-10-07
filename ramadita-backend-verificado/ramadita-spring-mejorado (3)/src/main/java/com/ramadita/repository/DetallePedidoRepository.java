package com.ramadita.repository;

import com.ramadita.entity.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Reemplaza la parte de PedidoDAO.listarDetalle(pedidoId).
 * En la practica casi no se usa directo: al pedir un Pedido con su relacion
 * @OneToMany, JPA ya trae los detalles solos. Se deja por si se necesita
 * una consulta independiente de detalles sin cargar el pedido completo.
 */
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {

    List<DetallePedido> findByPedidoId(Integer pedidoId);
}
