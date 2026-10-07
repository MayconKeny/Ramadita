package com.ramadita.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;

/**
 * Migrado desde com.ramadita.modelo.DetallePedido.
 * El constructor que calculaba el subtotal automaticamente se mantiene igual.
 */
@Entity
@Table(name = "detalle_pedido")
@Getter
@Setter
@NoArgsConstructor
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    @JsonIgnore // evita referencia ciclica al serializar a JSON (pedido -> detalles -> pedido...)
    private Pedido pedido;

    @Column(name = "plato_nombre", nullable = false, length = 100)
    private String platoNombre;

    @Column(nullable = false)
    private int cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    public DetallePedido(String platoNombre, int cantidad, BigDecimal precioUnitario) {
        this.platoNombre = platoNombre;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
    }
}
