package com.ramadita.repository;

import com.ramadita.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {
    List<Proveedor> findAllByOrderByNombreAsc();
}
