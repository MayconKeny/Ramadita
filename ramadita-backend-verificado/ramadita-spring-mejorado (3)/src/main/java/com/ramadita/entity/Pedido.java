package com.ramadita.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Migrado desde com.ramadita.modelo.Pedido.
 *
 * Cambio respecto al original: los "detalles" ahora son una relacion JPA real
 * (@OneToMany) en vez de una lista que se llenaba a mano con una query aparte
 * (como hacia PedidoServlet con dao.listarDetalle(p.getId()) en el caso "cocina").
 * JPA se encarga de cargarlos automaticamente cuando se necesite.
 */
@Entity
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private int mesa;

    @Column(nullable = false, length = 100)
    private String mesero;

    @Column(nullable = false, length = 20)
    private String estado = "Pendiente";

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "metodo_pago", length = 30)
    private String metodoPago;

    @Column(name = "descuento_monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal descuentoMonto = BigDecimal.ZERO;

    @Column(name = "promocion_nombre", length = 100)
    private String promocionNombre;

    @Column(name = "cliente_telefono", length = 20)
    private String clienteTelefono;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // FetchType.EAGER (no LAZY): la app usa spring.jpa.open-in-view=false,
    // asi que si esta lista quedara LAZY, Jackson tronaria con
    // "could not initialize proxy - no Session" al armar el JSON, porque
    // la sesion de Hibernate ya se cerro para cuando se serializa la
    // respuesta. Al ser una lista chica (los platos de un pedido), no hay
    // costo real en traerla siempre junto con el pedido.
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<DetallePedido> detalles = new ArrayList<>();

    /** Util para agregar un detalle manteniendo ambos lados de la relacion sincronizados. */
    public void agregarDetalle(DetallePedido detalle) {
        detalles.add(detalle);
        detalle.setPedido(this);
    }
}
