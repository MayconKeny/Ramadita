package com.ramadita.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Handler de WebSocket "crudo" (sin STOMP) para avisar a la pantalla de
 * Cocina cuando entra un pedido nuevo o cambia de estado, sin que el
 * mesero de cocina tenga que refrescar la pagina cada rato.
 *
 * Se eligio un WebSocketHandler simple en vez de STOMP porque el
 * frontend solo necesita recibir un aviso ("hay novedades, vuelve a
 * pedir la lista") -- no hace falta el modelo pub/sub de topicos que
 * trae STOMP para un caso de uso tan chico.
 */
@Component
public class CocinaWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sesiones = new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sesiones.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sesiones.remove(session);
    }

    /** Llamado desde PedidoService cada vez que hay un cambio relevante para cocina. */
    public void avisar(String evento) {
        TextMessage mensaje = new TextMessage(evento);
        for (WebSocketSession s : sesiones) {
            try {
                if (s.isOpen()) {
                    s.sendMessage(mensaje);
                }
            } catch (IOException ignored) {
                // Si una sesion fallo al mandar, se limpia sola en el proximo afterConnectionClosed.
            }
        }
    }
}
