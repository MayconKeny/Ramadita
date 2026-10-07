package com.ramadita.repository;

import com.ramadita.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Reemplaza a UsuarioDAO.java.
 *
 * Notas sobre el mapeo de los metodos originales:
 *  - login(usuario, contrasena) -> ya NO existe aqui. La verificacion de contrasena
 *    (con BCrypt) la hace Spring Security automaticamente. Lo unico que se necesita
 *    del repository es buscar por username: findByUsuario().
 *  - listar() -> findAll() (lo provee JpaRepository gratis).
 *  - insertar() / actualizar() -> save() (lo provee JpaRepository gratis. Si el
 *    objeto no tiene id, hace INSERT; si tiene id existente, hace UPDATE).
 *  - eliminar(id) -> deleteById() (gratis).
 *  - usuarioExiste(usuario, excludeId) -> existsByUsuarioAndIdNot()
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByUsuario(String usuario);

    boolean existsByUsuarioAndIdNot(String usuario, Integer id);

    // Para el caso de un usuario nuevo (sin id todavia que excluir)
    boolean existsByUsuario(String usuario);
}
