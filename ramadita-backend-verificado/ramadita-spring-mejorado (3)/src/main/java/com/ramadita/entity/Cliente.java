package com.ramadita.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Nueva: clientes frecuentes. Se identifican por telefono (es lo unico
 * que un mesero puede pedirle rapido a un comensal sin ser invasivo).
 * Cada vez que un pedido con ese telefono se cobra, PedidoService suma
 * una visita y actualiza la fecha -- no hace falta que el admin lo
 * mantenga a mano, aunque tambien puede crear/editar clientes directo.
 */
@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 20)
    private String telefono;

    @Column(nullable = false)
    private int visitas = 0;

    @Column(name = "ultima_visita")
    private LocalDateTime ultimaVisita;
}
