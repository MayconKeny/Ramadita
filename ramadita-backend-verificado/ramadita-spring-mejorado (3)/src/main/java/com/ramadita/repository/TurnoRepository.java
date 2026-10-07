package com.ramadita.repository;

import com.ramadita.entity.Turno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TurnoRepository extends JpaRepository<Turno, Integer> {

    Optional<Turno> findFirstByEstadoOrderByFechaAperturaDesc(String estado);

    List<Turno> findAllByOrderByFechaAperturaDesc();
}
