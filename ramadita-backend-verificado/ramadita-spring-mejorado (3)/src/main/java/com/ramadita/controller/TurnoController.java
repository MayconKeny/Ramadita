package com.ramadita.controller;

import com.ramadita.dto.ApiResponse;
import com.ramadita.entity.Turno;
import com.ramadita.security.UsuarioActual;
import com.ramadita.service.TurnoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/turnos")
@RequiredArgsConstructor
public class TurnoController {

    private final TurnoService turnoService;
    private final UsuarioActual usuarioActual;

    @GetMapping("/activo")
    public ApiResponse activo() {
        return turnoService.obtenerActivo()
                .<ApiResponse>map(ApiResponse::ok)
                .orElseGet(() -> ApiResponse.ok(null));
    }

    @GetMapping
    public List<Turno> historial() {
        return turnoService.historial();
    }

    @PostMapping("/abrir")
    public ApiResponse abrir(@RequestBody Map<String, Object> body) {
        BigDecimal montoInicial = new BigDecimal(body.get("montoInicial").toString());
        Turno turno = turnoService.abrir(usuarioActual.obtener().getNombre(), montoInicial);
        return ApiResponse.ok(turno);
    }

    @PostMapping("/{id}/cerrar")
    public ApiResponse cerrar(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        BigDecimal montoFinal = new BigDecimal(body.get("montoFinalContado").toString());
        String observaciones = (String) body.getOrDefault("observaciones", "");
        Turno turno = turnoService.cerrar(id, usuarioActual.obtener().getNombre(), montoFinal, observaciones);
        return ApiResponse.ok(turno);
    }
}
