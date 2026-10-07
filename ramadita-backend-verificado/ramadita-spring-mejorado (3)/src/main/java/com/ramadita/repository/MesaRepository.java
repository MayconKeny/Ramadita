package com.ramadita.repository;

import com.ramadita.entity.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MesaRepository extends JpaRepository<Mesa, Integer> {

    java.util.List<Mesa> findAllByOrderByNumeroAsc();

    Optional<Mesa> findByNumero(int numero);
}
