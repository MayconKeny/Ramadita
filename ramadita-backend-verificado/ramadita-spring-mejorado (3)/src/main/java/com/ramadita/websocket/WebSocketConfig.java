package com.ramadita.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final CocinaWebSocketHandler cocinaWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(cocinaWebSocketHandler, "/ws/cocina")
                // setAllowedOrigins("*") porque en desarrollo el navegador ve el
                // origen como localhost:5173 (Vite) aunque el WS termine en 8080;
                // el proxy de Vite reescribe la conexion pero el navegador igual
                // manda el header Origin original.
                .setAllowedOrigins("*");
    }
}
