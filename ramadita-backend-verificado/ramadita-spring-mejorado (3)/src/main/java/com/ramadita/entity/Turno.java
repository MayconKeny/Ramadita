package com.ramadita.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Nueva: antes la pagina "Caja" solo calculaba totales del dia al vuelo
 * desde los pedidos, sin guardar nada. No habia forma de saber quien
 * abrio caja, con cuanto, ni si el conteo final cuadraba.
 *
 * Un Turno representa el periodo entre que un cajero abre caja (con un
 * monto inicial de vuelto) y la cierra (contando el efectivo real y
 * comparandolo contra lo que el sistema esperaba segun las ventas).
 */
@Entity
@Table(name = "turnos")
@Getter
@Setter
@NoArgsConstructor
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String usuarioApertura;

    @CreationTimestamp
    @Column(name = "fecha_apertura", nullable = false, updatable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "monto_inicial", nullable = false)
    private BigDecimal montoInicial;

    @Column(name = "usuario_cierre", length = 100)
    private String usuarioCierre;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "monto_esperado")
    private BigDecimal montoEsperado;

    @Column(name = "monto_final_contado")
    private BigDecimal montoFinalContado;

    @Column(name = "diferencia")
    private BigDecimal diferencia;

    @Column(length = 300)
    private String observaciones;

    @Column(nullable = false, length = 20)
    private String estado = "ABIERTO"; // ABIERTO | CERRADO
}
