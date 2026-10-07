package com.ramadita.security;

import com.ramadita.entity.Usuario;
import com.ramadita.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Reemplaza la parte de UsuarioDAO.login() que verificaba usuario/contrasena
 * a mano con una query SQL. Spring Security llama a este metodo automaticamente
 * cuando alguien intenta iniciar sesion: busca el usuario por username, y LUEGO
 * Spring compara la contrasena ingresada con el hash BCrypt guardado (eso ya
 * no lo hacemos nosotros, lo hace el PasswordEncoder configurado en Paso 5.2).
 */
@Service
@RequiredArgsConstructor
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario u = usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        if (!u.isActivo()) {
            throw new UsernameNotFoundException("Usuario inactivo: " + username);
        }

        // El prefijo "ROLE_" es la convencion que Spring Security espera
        // para poder usar hasRole("ADMIN") en vez de hasAuthority("ROLE_ADMIN").
        return new org.springframework.security.core.userdetails.User(
                u.getUsuario(),
                u.getContrasena(), // ya es un hash BCrypt
                List.of(new SimpleGrantedAuthority("ROLE_" + u.getRol().name()))
        );
    }
}
