package com.ramadita.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

/**
 * Migrado desde com.ramadita.modelo.Plato. Mapea a la tabla "carta"
 * (se mantiene el nombre de tabla original para no perder los datos existentes).
 */
@Entity
@Table(name = "carta")
@Getter
@Setter
@NoArgsConstructor
public class Plato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal precio;

    @Column(nullable = false, length = 50)
    private String categoria = "Otros";

    @Column(name = "foto_url", columnDefinition = "TEXT")
    private String fotoUrl;

    @Column(nullable = false)
    private boolean activo = true;
}
