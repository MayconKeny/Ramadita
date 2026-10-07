package com.ramadita.repository;

import com.ramadita.entity.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PromocionRepository extends JpaRepository<Promocion, Integer> {

    List<Promocion> findAllByOrderByNombreAsc();

    List<Promocion> findByActivoTrueOrderByNombreAsc();
}
