package com.ramadita.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

/**
 * Migrado desde com.ramadita.modelo.Inventario.
 * El metodo isStockBajo() se mantiene igual: es logica de negocio simple,
 * no necesita cambiar al pasar a JPA.
 */
@Entity
@Table(name = "inventario")
@Getter
@Setter
@NoArgsConstructor
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(nullable = false)
    private double cantidad;

    @Column(nullable = false, length = 20)
    private String unidad;

    @Column(name = "stock_minimo", nullable = false)
    private double stockMinimo;

    /** Igual que en el codigo original: true si la cantidad ya llego al minimo. */
    @Transient
    public boolean isStockBajo() {
        return cantidad <= stockMinimo;
    }
}
