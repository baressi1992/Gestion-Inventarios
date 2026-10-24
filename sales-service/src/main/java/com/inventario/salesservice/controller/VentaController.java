package com.inventario.salesservice.controller;

import com.inventario.salesservice.model.Venta;
import com.inventario.salesservice.repository.VentaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    private final VentaRepository ventaRepository;
    private final RestClient restClient;

    public VentaController(
            VentaRepository ventaRepository,
            RestClient.Builder restClientBuilder) {
        this.ventaRepository = ventaRepository;
        this.restClient = restClientBuilder.build();
    }

    @GetMapping
    public List<Venta> listarVentas() {
        return ventaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venta> buscarVenta(@PathVariable Long id) {
        return ventaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> registrarVenta(
            @RequestBody Venta venta,
            @RequestHeader(value = "Authorization", required = false)
            String authorization) {

        if (venta.getProductoId() == null
                || venta.getNombreProducto() == null
                || venta.getNombreProducto().isBlank()
                || venta.getCantidad() == null
                || venta.getCantidad() <= 0
                || venta.getPrecioUnitario() == null
                || venta.getPrecioUnitario()
                .compareTo(BigDecimal.ZERO) <= 0) {

            return ResponseEntity.badRequest().body(
                    Map.of("mensaje",
                            "Debes enviar un producto, una cantidad positiva y un precio válido.")
            );
        }

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("mensaje", "Debes iniciar sesión para registrar la venta.")
            );
        }

        try {
            // Descontar el stock a través del API Gateway
            restClient.post()
                    .uri("http://localhost:8080/api/productos/{id}/descontar?cantidad={cantidad}",
                            venta.getProductoId(),
                            venta.getCantidad())
                    .header("Authorization", authorization)
                    .retrieve()
                    .toBodilessEntity();

            // Guardar la venta solo si el descuento tuvo éxito
            venta.setId(null);
            venta.setTotal(
                    venta.getPrecioUnitario()
                            .multiply(BigDecimal.valueOf(venta.getCantidad()))
            );

            Venta guardada = ventaRepository.save(venta);

            return ResponseEntity.status(HttpStatus.CREATED).body(guardada);

        } catch (HttpClientErrorException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(
                    Map.of("mensaje",
                            ex.getResponseBodyAsString().isBlank()
                                    ? "No se pudo descontar el stock."
                                    : ex.getResponseBodyAsString())
            );
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                    Map.of("mensaje",
                            "No se pudo contactar con inventario. No se registró la venta.")
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVenta(@PathVariable Long id) {
        if (!ventaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        ventaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
