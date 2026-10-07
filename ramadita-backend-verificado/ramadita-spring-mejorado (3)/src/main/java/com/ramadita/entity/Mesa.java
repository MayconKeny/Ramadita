package com.ramadita.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

/**
 * Nueva: antes "mesa" era solo un numero suelto (int) dentro de Pedido,
 * sin ningun registro de si esa mesa estaba libre, ocupada o reservada.
 * Esta entidad agrega ese estado real para poder mostrar un mapa del
 * local en el frontend (pagina Mesas).
 *
 * OJO: Pedido.mesa se mantiene como int (compatibilidad con lo que ya
 * existe), la relacion con esta tabla es por numero de mesa, no por FK,
 * para no romper nada de lo que ya esta guardado.
 */
@Entity
@Table(name = "mesas")
@Getter
@Setter
@NoArgsConstructor
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private int numero;

    @Column(nullable = false)
    private int capacidad = 4;

    @Column(nullable = false, length = 20)
    private String estado = "LIBRE"; // LIBRE | OCUPADA | RESERVADA
}
