package com.ramadita.service;

import com.ramadita.entity.Turno;
import com.ramadita.repository.PedidoRepository;
import com.ramadita.repository.TurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TurnoService {

    private final TurnoRepository turnoRepository;
    private final PedidoRepository pedidoRepository;

    public Optional<Turno> obtenerActivo() {
        return turnoRepository.findFirstByEstadoOrderByFechaAperturaDesc("ABIERTO");
    }

    public List<Turno> historial() {
        return turnoRepository.findAllByOrderByFechaAperturaDesc();
    }

    @Transactional
    public Turno abrir(String usuario, BigDecimal montoInicial) {
        if (montoInicial == null || montoInicial.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El monto inicial no puede ser negativo.");
        }

        // No se puede abrir un turno nuevo si ya hay uno abierto -- eso mezclaria
        // el efectivo de dos cajeros distintos en un mismo arqueo.
        obtenerActivo().ifPresent(t -> {
            throw new IllegalStateException("Ya hay un turno abierto (folio #" + t.getId() + "). Cierra ese turno primero.");
        });

        Turno turno = new Turno();
        turno.setUsuarioApertura(usuario);
        turno.setMontoInicial(montoInicial);
        turno.setEstado("ABIERTO");
        return turnoRepository.save(turno);
    }

    @Transactional
    public Turno cerrar(Integer id, String usuario, BigDecimal montoFinalContado, String observaciones) {
        if (montoFinalContado == null || montoFinalContado.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El monto contado no puede ser negativo.");
        }

        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Turno no encontrado: " + id));

        if ("CERRADO".equals(turno.getEstado())) {
            throw new IllegalStateException("Este turno ya esta cerrado.");
        }

        LocalDateTime ahora = LocalDateTime.now();
        BigDecimal efectivoVendido = pedidoRepository.totalEfectivoEntre(turno.getFechaApertura(), ahora);
        BigDecimal montoEsperado = turno.getMontoInicial().add(efectivoVendido);

        turno.setFechaCierre(ahora);
        turno.setUsuarioCierre(usuario);
        turno.setMontoEsperado(montoEsperado);
        turno.setMontoFinalContado(montoFinalContado);
        turno.setDiferencia(montoFinalContado.subtract(montoEsperado));
        turno.setObservaciones(observaciones);
        turno.setEstado("CERRADO");

        return turnoRepository.save(turno);
    }
}
