package com.ramadita.service;

import com.ramadita.entity.Promocion;
import com.ramadita.repository.PromocionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromocionService {

    private final PromocionRepository promocionRepository;

    public List<Promocion> listar() {
        return promocionRepository.findAllByOrderByNombreAsc();
    }

    public List<Promocion> listarActivas() {
        return promocionRepository.findByActivoTrueOrderByNombreAsc();
    }

    @Transactional
    public Promocion guardar(Promocion datos) {
        if (!"PORCENTAJE".equals(datos.getTipo()) && !"MONTO_FIJO".equals(datos.getTipo())) {
            throw new IllegalArgumentException("Tipo de promoción inválido: usa PORCENTAJE o MONTO_FIJO.");
        }
        if (datos.getValor() == null || datos.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El valor del descuento debe ser mayor a 0.");
        }
        if ("PORCENTAJE".equals(datos.getTipo()) && datos.getValor().compareTo(BigDecimal.valueOf(100)) > 0) {
            // Sin este limite, un porcentaje mal escrito (ej. "150" en vez de
            // "15") dejaba el total del pedido en negativo al cobrar.
            throw new IllegalArgumentException("Un descuento por porcentaje no puede superar el 100%.");
        }
        return promocionRepository.save(datos);
    }

    @Transactional
    public void eliminar(Integer id) {
        promocionRepository.deleteById(id);
    }

    /** Calcula el monto de descuento para un total dado, sin dejarlo pasar de ese total. */
    public BigDecimal calcularDescuento(Promocion promo, BigDecimal total) {
        BigDecimal descuento = "PORCENTAJE".equals(promo.getTipo())
                ? total.multiply(promo.getValor()).divide(BigDecimal.valueOf(100))
                : promo.getValor();
        return descuento.min(total);
    }
}
