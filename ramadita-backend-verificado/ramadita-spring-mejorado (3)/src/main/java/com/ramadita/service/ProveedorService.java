package com.ramadita.service;

import com.ramadita.entity.Proveedor;
import com.ramadita.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public List<Proveedor> listar() {
        return proveedorRepository.findAllByOrderByNombreAsc();
    }

    @Transactional
    public Proveedor guardar(Proveedor datos) {
        if (datos.getNombre() == null || datos.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del proveedor es obligatorio.");
        }
        if (datos.getRuc() != null && !datos.getRuc().isBlank() && !datos.getRuc().matches("\\d{11}")) {
            throw new IllegalArgumentException("El RUC debe tener 11 digitos numericos.");
        }
        if (datos.getEmail() != null && !datos.getEmail().isBlank()
                && !datos.getEmail().matches("^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$")) {
            throw new IllegalArgumentException("El correo del proveedor no es valido.");
        }
        return proveedorRepository.save(datos);
    }

    @Transactional
    public void eliminar(Integer id) {
        proveedorRepository.deleteById(id);
    }
}
