package com.ramadita.service;

import com.ramadita.entity.Inventario;
import com.ramadita.repository.InventarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Reemplaza la logica de negocio de InventarioServlet.java. */
@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InventarioRepository inventarioRepository;

    public List<Inventario> listar() {
        return inventarioRepository.findAllByOrderByCategoriaAscNombreAsc();
    }

    public List<Inventario> listarBajoStock() {
        return inventarioRepository.findBajoStock();
    }

    @Transactional
    public Inventario guardar(Inventario datos) {
        if (datos.getCantidad() < 0) {
            throw new IllegalArgumentException("La cantidad en stock no puede ser negativa.");
        }
        if (datos.getStockMinimo() < 0) {
            throw new IllegalArgumentException("El stock mínimo no puede ser negativo.");
        }
        return inventarioRepository.save(datos);
    }

    @Transactional
    public void eliminar(Integer id) {
        inventarioRepository.deleteById(id);
    }
}
