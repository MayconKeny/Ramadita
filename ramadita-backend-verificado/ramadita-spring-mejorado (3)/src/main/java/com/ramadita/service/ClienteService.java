package com.ramadita.service;

import com.ramadita.entity.Cliente;
import com.ramadita.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public List<Cliente> listar() {
        return clienteRepository.findAllByOrderByVisitasDescNombreAsc();
    }

    @Transactional
    public Cliente guardar(Cliente datos) {
        return clienteRepository.save(datos);
    }

    @Transactional
    public void eliminar(Integer id) {
        clienteRepository.deleteById(id);
    }

    /**
     * Se llama desde PedidoService al cobrar un pedido que trae telefono
     * de cliente. Si el telefono ya existe, suma visita; si no, lo crea
     * con nombre generico (el admin puede completarlo despues en la
     * pagina de Clientes).
     */
    @Transactional
    public void registrarVisita(String telefono, String nombreSugerido) {
        if (telefono == null || telefono.isBlank()) return;

        Cliente cliente = clienteRepository.findByTelefono(telefono.trim())
                .orElseGet(() -> {
                    Cliente nuevo = new Cliente();
                    nuevo.setTelefono(telefono.trim());
                    nuevo.setNombre(nombreSugerido != null && !nombreSugerido.isBlank() ? nombreSugerido : "Cliente");
                    return nuevo;
                });
        cliente.setVisitas(cliente.getVisitas() + 1);
        cliente.setUltimaVisita(LocalDateTime.now());
        clienteRepository.save(cliente);
    }
}
