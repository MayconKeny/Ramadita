package com.ramadita.entity;

/**
 * Roles del sistema. Coincide con la logica que ya tenias en RolFilter,
 * agregando CAJERO que el filtro ya manejaba pero faltaba en el ENUM de la BD original.
 */
public enum Rol {
    ADMIN,
    MESERO,
    COCINA,
    CAJERO
}
