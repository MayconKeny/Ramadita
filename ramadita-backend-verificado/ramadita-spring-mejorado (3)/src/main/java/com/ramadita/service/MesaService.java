package com.ramadita.service;

import com.ramadita.entity.Mesa;
import com.ramadita.repository.MesaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MesaService {

    private final MesaRepository mesaRepository;

    public List<Mesa> listar() {
        return mesaRepository.findAllByOrderByNumeroAsc();
    }

    private static final java.util.Set<String> ESTADOS_VALIDOS = java.util.Set.of("LIBRE", "OCUPADA", "RESERVADA");

    @Transactional
    public Mesa guardar(Mesa datos) {
        if (datos.getNumero() <= 0) {
            throw new IllegalArgumentException("El número de mesa debe ser mayor a 0.");
        }
        if (datos.getCapacidad() <= 0) {
            throw new IllegalArgumentException("La capacidad debe ser mayor a 0.");
        }
        try {
            return mesaRepository.save(datos);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // El numero de mesa es unique a nivel de base de datos; sin este
            // catch, intentar crear dos mesas con el mismo numero devolvia
            // un error 500 generico en vez de un mensaje que el mesero entienda.
            throw new IllegalArgumentException("Ya existe una mesa con el número " + datos.getNumero() + ".");
        }
    }

    @Transactional
    public void eliminar(Integer id) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));
        // Si se elimina una mesa Ocupada, el pedido activo que la referencia
        // queda "huerfano": ya no aparece en ningun mapa de mesas pero sigue
        // Pendiente/Preparando en el sistema, y esa mesa jamas se vuelve a
        // poder liberar automaticamente al cobrar.
        if ("OCUPADA".equals(mesa.getEstado())) {
            throw new IllegalStateException("No se puede eliminar la mesa " + mesa.getNumero() + " porque tiene un pedido activo. Cóbralo primero.");
        }
        mesaRepository.deleteById(id);
    }

    @Transactional
    public Mesa cambiarEstado(Integer id, String estado) {
        if (!ESTADOS_VALIDOS.contains(estado)) {
            throw new IllegalArgumentException("Estado invalido: " + estado + ". Usa LIBRE, OCUPADA o RESERVADA.");
        }
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));
        mesa.setEstado(estado);
        return mesaRepository.save(mesa);
    }

    /**
     * Usado por PedidoService.registrar() para impedir abrir un pedido
     * nuevo sobre una mesa que ya tiene uno activo. Si la mesa no existe
     * como registro (numero suelto, nunca dado de alta en el mapa de
     * Mesas), se deja pasar -- no todos los numeros de mesa usados en
     * Pedidos tienen por que existir tambien en el modulo Mesas.
     */
    public boolean estaOcupada(int numero) {
        return mesaRepository.findByNumero(numero)
                .map(m -> "OCUPADA".equals(m.getEstado()))
                .orElse(false);
    }

    /**
     * Se llama desde PedidoService cuando se registra un pedido nuevo,
     * para que la mesa pase a OCUPADA automaticamente sin que el mesero
     * tenga que marcarla a mano.
     */
    @Transactional
    public void marcarOcupadaPorNumero(int numero) {
        mesaRepository.findByNumero(numero).ifPresent(m -> {
            m.setEstado("OCUPADA");
            mesaRepository.save(m);
        });
    }

    /**
     * Se llama desde PedidoService cuando se cobra un pedido, para
     * liberar la mesa automaticamente.
     */
    @Transactional
    public void marcarLibrePorNumero(int numero) {
        mesaRepository.findByNumero(numero).ifPresent(m -> {
            m.setEstado("LIBRE");
            mesaRepository.save(m);
        });
    }
}
