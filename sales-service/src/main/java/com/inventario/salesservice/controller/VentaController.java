package com.inventario.salesservice.controller;

import com.inventario.salesservice.dto.SolicitudVenta;
import com.inventario.salesservice.model.DetalleVenta;
import com.inventario.salesservice.model.Venta;
import com.inventario.salesservice.repository.VentaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.ArrayList;
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
    public Page<Venta> listarVentas(
            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "fecha",
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {

        return ventaRepository.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venta> buscarVenta(@PathVariable Long id) {
        return ventaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> registrarVenta(
            @RequestBody SolicitudVenta solicitud,
            @RequestHeader(value = "Authorization", required = false)
            String authorization) {

        if (authorization == null
                || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "mensaje",
                            "Debes iniciar sesión para registrar la venta."
                    ));
        }

        if (solicitud == null
                || solicitud.getProductos() == null
                || solicitud.getProductos().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "mensaje",
                    "Debes incluir al menos un producto."
            ));
        }

        // Validar todos los productos antes de descontar stock.
        for (SolicitudVenta.ProductoVentaRequest producto
                : solicitud.getProductos()) {

            if (producto == null
                    || producto.getProductoId() == null
                    || producto.getNombreProducto() == null
                    || producto.getNombreProducto().isBlank()
                    || producto.getCantidad() == null
                    || producto.getCantidad() <= 0
                    || producto.getPrecioUnitario() == null
                    || producto.getPrecioUnitario()
                    .compareTo(BigDecimal.ZERO) <= 0) {

                return ResponseEntity.badRequest().body(Map.of(
                        "mensaje",
                        "Revisa los productos, las cantidades y los precios."
                ));
            }
        }

        Venta venta = new Venta();
        List<DetalleVenta> detalles = new ArrayList<>();

        for (SolicitudVenta.ProductoVentaRequest producto
                : solicitud.getProductos()) {

            DetalleVenta detalle = new DetalleVenta();

            detalle.setProductoId(producto.getProductoId());
            detalle.setNombreProducto(producto.getNombreProducto());
            detalle.setCantidad(producto.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecioUnitario());

            BigDecimal subtotal = producto.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(producto.getCantidad()));

            detalle.setSubtotal(subtotal);
            detalles.add(detalle);
        }

        venta.setDetalles(detalles);
        venta.calcularTotal();

        /*
         * Descontamos el stock de cada producto usando
         * el endpoint existente del inventario.
         */
        try {
            for (SolicitudVenta.ProductoVentaRequest producto
                    : solicitud.getProductos()) {

                restClient.post()
                        .uri(
                                "http://localhost:8080/api/productos/{id}/descontar?cantidad={cantidad}",
                                producto.getProductoId(),
                                producto.getCantidad()
                        )
                        .header("Authorization", authorization)
                        .retrieve()
                        .toBodilessEntity();
            }

            Venta guardada = ventaRepository.save(venta);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(guardada);

        } catch (HttpClientErrorException ex) {

            return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
                    "mensaje",
                    "No se pudo descontar el stock de uno de los productos. "
                            + "Verifica el inventario antes de volver a intentarlo."
            ));

        } catch (Exception ex) {

            return ResponseEntity.status(
                    HttpStatus.SERVICE_UNAVAILABLE
            ).body(Map.of(
                    "mensaje",
                    "No se pudo completar la operación. "
                            + "Revisa el inventario y el servicio de ventas."
            ));
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
