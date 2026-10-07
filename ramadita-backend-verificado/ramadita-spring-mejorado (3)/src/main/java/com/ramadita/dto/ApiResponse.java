package com.ramadita.dto;

/**
 * Mismo formato de respuesta JSON que usaban los Servlets originales:
 * {"success": true} o {"success": false, "error": "..."}
 */
public record ApiResponse(boolean success, String error, Object data) {

    public static ApiResponse ok() {
        return new ApiResponse(true, null, null);
    }

    public static ApiResponse ok(Object data) {
        return new ApiResponse(true, null, data);
    }

    public static ApiResponse error(String mensaje) {
        return new ApiResponse(false, mensaje, null);
    }
}
