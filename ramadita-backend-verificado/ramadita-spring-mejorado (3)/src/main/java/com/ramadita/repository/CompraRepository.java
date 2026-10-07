package com.ramadita.repository;

import com.ramadita.entity.Compra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompraRepository extends JpaRepository<Compra, Integer> {
    List<Compra> findTop100ByOrderByIdDesc();
}
