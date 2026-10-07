package com.ramadita.repository;

import com.ramadita.entity.Plato;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Reemplaza a CartaDAO.java.
 *
 *  - listar() -> findAllByOrderByCategoriaAscNombreAsc() (mismo ORDER BY categoria, nombre del original)
 *  - listarActivos() -> findByActivoTrueOrderByCategoriaAscNombreAsc()
 *  - insertar()/actualizar() -> save()
 *  - eliminar(id) -> deleteById()
 */
public interface PlatoRepository extends JpaRepository<Plato, Integer> {

    List<Plato> findAllByOrderByCategoriaAscNombreAsc();

    List<Plato> findByActivoTrueOrderByCategoriaAscNombreAsc();
}
