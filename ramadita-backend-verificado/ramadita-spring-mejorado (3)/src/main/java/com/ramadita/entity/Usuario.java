package com.ramadita.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

/**
 * Migrado desde com.ramadita.modelo.Usuario (proyecto original NetBeans/Servlets).
 *
 * Cambios respecto al original:
 *  - "contrasena" ahora se guarda con hash BCrypt (antes texto plano).
 *  - "rol" ahora es un enum tipado en vez de String libre.
 */
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 50)
    private String usuario;

    /** Hash BCrypt de la contraseña. Nunca se guarda en texto plano. */
    @Column(nullable = false, length = 255)
    private String contrasena;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol;

    @Column(nullable = false)
    private boolean activo = true;
}
