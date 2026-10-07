package com.ramadita.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

/**
 * Reemplaza COMPLETAMENTE a RolFilter.java + LoginServlet.java + LogoutServlet.java.
 *
 * Mapeo de roles, igual que en el filtro original (ver comentario de cabecera
 * de RolFilter.java):
 *   ADMIN   -> todo
 *   MESERO  -> carta (solo lectura), pedidos (registrar, agregarItems, cobrar, listar, detalle)
 *   COCINA  -> pedidos (ver cocina, detalle, cambiar estado)
 *   CAJERO  -> pedidos (listar, detalle, caja, cobrar) -- el filtro original ya
 *              contemplaba este rol aunque faltaba en el ENUM de la base de datos.
 *
 * Las rutas se migran 1 a 1 desde los nombres de Servlet a los nuevos endpoints REST:
 *   /CartaServlet      -> /api/carta/**
 *   /PedidoServlet     -> /api/pedidos/**
 *   /InventarioServlet -> /api/inventario/**
 *   /UsuarioServlet    -> /api/usuarios/**
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UsuarioDetailsService usuarioDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt: reemplaza la comparacion en texto plano del UsuarioDAO original.
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // --- Recursos publicos: equivalente a las rutas publicas del RolFilter original ---
                .requestMatchers("/login", "/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()

                // --- Carta: meseros y cajeros solo lectura (GET), admin todo ---
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/carta/**")
                    .hasAnyRole("ADMIN", "MESERO", "COCINA", "CAJERO")
                .requestMatchers("/api/carta/**").hasRole("ADMIN")

                // --- Pedidos: cada rol tiene sus acciones especificas ---
                // IMPORTANTE: los patrones mas especificos (historial, caja, cocina, etc.)
                // deben ir ANTES que el comodin generico /api/pedidos/{id}, porque Spring
                // Security usa la PRIMERA regla que coincida. Un id de pedido siempre es
                // numerico, asi que usamos \\d+ para no chocar con las rutas de texto.
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/pedidos/historial",
                        "/api/pedidos/ventas-por-dia", "/api/pedidos/platos-mas-pedidos")
                    .hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/pedidos", "/api/pedidos/caja")
                    .hasAnyRole("ADMIN", "MESERO", "CAJERO")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/pedidos/cocina",
                        "/api/pedidos/*/detalle", "/api/pedidos/{id:\\d+}")
                    .hasAnyRole("ADMIN", "MESERO", "COCINA", "CAJERO")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/pedidos/registrar", "/api/pedidos/*/items")
                    .hasAnyRole("ADMIN", "MESERO")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/pedidos/*/cobrar")
                    .hasAnyRole("ADMIN", "MESERO", "CAJERO")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/pedidos/*/estado")
                    .hasAnyRole("ADMIN", "COCINA")

                // --- Mesas: admin y mesero pueden ver/gestionar; cocina y cajero solo lectura ---
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/mesas")
                    .hasAnyRole("ADMIN", "MESERO", "CAJERO", "COCINA")
                .requestMatchers("/api/mesas/**").hasAnyRole("ADMIN", "MESERO")

                // --- Turnos (cierre de caja): admin y cajero ---
                .requestMatchers("/api/turnos/**").hasAnyRole("ADMIN", "CAJERO")

                // --- WebSocket de cocina: cualquier rol que use la pantalla de cocina ---
                .requestMatchers("/ws/cocina").hasAnyRole("ADMIN", "COCINA", "MESERO", "CAJERO")

                // --- Promociones: admin gestiona; mesero/cajero solo ven las activas (para cobrar) ---
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/promociones/activas")
                    .hasAnyRole("ADMIN", "MESERO", "CAJERO")
                .requestMatchers("/api/promociones/**").hasRole("ADMIN")

                // --- Clientes: admin gestiona; mesero/cajero pueden ver la lista al registrar pedidos ---
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/clientes")
                    .hasAnyRole("ADMIN", "MESERO", "CAJERO")
                .requestMatchers("/api/clientes/**").hasRole("ADMIN")

                // --- Proveedores y Compras: solo admin ---
                .requestMatchers("/api/proveedores/**").hasRole("ADMIN")
                .requestMatchers("/api/compras/**").hasRole("ADMIN")

                // --- Inventario y Usuarios: solo admin, igual que el original ---
                .requestMatchers("/api/inventario/**").hasRole("ADMIN")
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")

                // --- Pagina principal (la SPA): cualquier usuario logueado, igual que el original ---
                .requestMatchers("/", "/index.html").authenticated()

                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginProcessingUrl("/login")
                .successHandler(loginExitoso())
                .failureHandler(loginFallido())
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler())
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .exceptionHandling(ex -> ex
                // Si una llamada AJAX no esta autenticada/autorizada, responder 401/403 JSON
                // en vez de redirigir a una pagina de login (igual que el "Accept: application/json" del RolFilter original)
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            // CSRF deshabilitado para simplificar las llamadas fetch del frontend existente.
            // Si en el futuro se requiere mayor seguridad, se puede habilitar con tokens CSRF en el JS.
            .csrf(csrf -> csrf.disable());

        return http.build();
    }

    /** Responde JSON con los datos de sesion que el frontend (index.jsp original) necesita. */
    private AuthenticationSuccessHandler loginExitoso() {
        return (request, response, authentication) -> {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.setStatus(HttpStatus.OK.value());
            String rol = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
            response.getWriter().write(
                "{\"success\":true,\"usuario\":\"" + authentication.getName() + "\",\"rol\":\"" + rol + "\"}"
            );
        };
    }

    private AuthenticationFailureHandler loginFallido() {
        return (request, response, exception) -> {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("{\"success\":false,\"error\":\"Usuario o contrasena incorrectos\"}");
        };
    }
}
