package com.ramadita.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Reemplaza la forma en que PedidoServlet leia los parametros sueltos
 * plato[], precio[], cantidad[] del request. Ahora llega como JSON
 * estructurado y Spring lo valida automaticamente.
 */
public class PedidoDTO {

    @Data
    public static class RegistrarRequest {
        @NotNull @Positive
        private Integer mesa;

        @NotBlank
        private String mesero;

        /** Opcional: si el mesero lo pide, permite reconocer clientes frecuentes. */
        private String clienteTelefono;

        @NotEmpty
        private List<@Valid ItemRequest> items;
    }

    @Data
    public static class AgregarItemsRequest {
        @NotEmpty
        private List<@Valid ItemRequest> items;
    }

    @Data
    public static class ItemRequest {
        @NotBlank
        private String platoNombre;

        @NotNull @Positive
        private Integer cantidad;

        @NotNull @Positive
        private BigDecimal precioUnitario;
    }

    @Data
    public static class CobrarRequest {
        @NotBlank
        private String metodoPago;

        /** Opcional: id de una Promocion activa a aplicar como descuento. */
        private Integer promocionId;
    }

    @Data
    public static class EstadoRequest {
        @NotBlank
        private String estado;
    }
}
