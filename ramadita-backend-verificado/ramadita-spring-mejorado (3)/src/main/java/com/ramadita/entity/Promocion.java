package com.ramadita.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

/**
 * Nueva: descuentos que el cajero/mesero puede aplicar al cobrar un pedido
 * (ej. "Happy Hour -20%", "Combo pareja -S/10"). El admin las crea y
 * activa/desactiva; solo las activas aparecen para elegir al cobrar.
 */
@Entity
@Table(name = "promociones")
@Getter
@Setter
@NoArgsConstructor
public class Promocion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 20)
    private String tipo; // PORCENTAJE | MONTO_FIJO

    @Column(nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal valor;

    @Column(nullable = false)
    private boolean activo = true;
}
