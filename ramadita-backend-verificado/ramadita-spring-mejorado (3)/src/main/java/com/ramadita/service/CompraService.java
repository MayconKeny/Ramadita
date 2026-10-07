package com.ramadita.service;

import com.ramadita.entity.Compra;
import com.ramadita.entity.Inventario;
import com.ramadita.repository.CompraRepository;
import com.ramadita.repository.InventarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompraService {

    private final CompraRepository compraRepository;
    private final InventarioRepository inventarioRepository;

    public List<Compra> listar() {
        return compraRepository.findTop100ByOrderByIdDesc();
    }

    /**
     * Registra la compra Y suma la cantidad comprada al stock del insumo
     * en un solo paso -- antes había que ir a Inventario y editar la
     * cantidad a mano, sin quedar registro de por que subio el stock.
     */
    @Transactional
    public Compra registrar(String proveedorNombre, Integer insumoId, double cantidad, BigDecimal precioUnitario) {
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad comprada debe ser mayor a 0.");
        }
        if (precioUnitario == null || precioUnitario.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio unitario debe ser mayor a 0.");
        }

        Inventario insumo = inventarioRepository.findById(insumoId)
                .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + insumoId));

        Compra compra = new Compra();
        compra.setProveedorNombre(proveedorNombre);
        compra.setInsumoId(insumoId);
        compra.setInsumoNombre(insumo.getNombre());
        compra.setCantidad(cantidad);
        compra.setPrecioUnitario(precioUnitario);
        compra.setTotal(precioUnitario.multiply(BigDecimal.valueOf(cantidad)));

        insumo.setCantidad(insumo.getCantidad() + cantidad);
        inventarioRepository.save(insumo);

        return compraRepository.save(compra);
    }
}
