package com.ramadita.service;

import com.ramadita.entity.Plato;
import com.ramadita.repository.PlatoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Reemplaza la logica de negocio de CartaServlet.java. */
@Service
@RequiredArgsConstructor
public class PlatoService {

    private final PlatoRepository platoRepository;

    public List<Plato> listar() {
        return platoRepository.findAllByOrderByCategoriaAscNombreAsc();
    }

    public List<Plato> listarActivos() {
        return platoRepository.findByActivoTrueOrderByCategoriaAscNombreAsc();
    }

    /** Reemplaza accion="guardar": save() decide solo si es INSERT o UPDATE. */
    @Transactional
    public Plato guardar(Plato datos) {
        return platoRepository.save(datos);
    }

    @Transactional
    public void eliminar(Integer id) {
        platoRepository.deleteById(id);
    }
}
