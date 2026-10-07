package com.ramadita.repository;

import com.ramadita.entity.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Reemplaza a InventarioDAO.java.
 *
 *  - listar() -> findAllByOrderByCategoriaAscNombreAsc()
 *  - listarBajoStock() -> query explicita porque compara dos columnas entre si
 *    (cantidad <= stock_minimo), algo que la nomenclatura automatica de Spring
 *    Data no puede expresar (solo compara una columna contra un valor fijo).
 */
public interface InventarioRepository extends JpaRepository<Inventario, Integer> {

    List<Inventario> findAllByOrderByCategoriaAscNombreAsc();

    @Query("SELECT i FROM Inventario i WHERE i.cantidad <= i.stockMinimo ORDER BY i.nombre ASC")
    List<Inventario> findBajoStock();
}
