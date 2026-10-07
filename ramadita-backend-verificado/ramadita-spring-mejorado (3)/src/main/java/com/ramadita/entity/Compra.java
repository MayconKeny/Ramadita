package com.ramadita.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Nueva: reabastecimiento de inventario con trazabilidad. Antes
 * Inventario.cantidad se editaba a mano sin quedar registro de cuando
 * se compro, a quien, ni a que precio -- con esto queda historial real
 * de compras, y de paso suma el stock automaticamente al insumo.
 */
@Entity
@Table(name = "compras")
@Getter
@Setter
@NoArgsConstructor
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "proveedor_nombre", nullable = false, length = 100)
    private String proveedorNombre;

    @Column(name = "insumo_id", nullable = false)
    private Integer insumoId;

    @Column(name = "insumo_nombre", nullable = false, length = 100)
    private String insumoNombre;

    @Column(nullable = false)
    private double cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
