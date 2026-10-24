package com.inventario.inventoryservice.controller;

import com.inventario.inventoryservice.entity.Producto;
import com.inventario.inventoryservice.repository.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscarProducto(@PathVariable Long id) {
        return productoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Producto> registrarProducto(
            @RequestBody Producto producto) {

        producto.setId(null);

        Producto guardado = productoRepository.save(producto);

        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(
            @PathVariable Long id,
            @RequestBody Producto datos) {

        return productoRepository.findById(id)
                .map(producto -> {
                    producto.setNombre(datos.getNombre());
                    producto.setPrecio(datos.getPrecio());
                    producto.setCantidad(datos.getCantidad());
                    producto.setCategoria(datos.getCategoria());

                    Producto actualizado =
                            productoRepository.save(producto);

                    return ResponseEntity.ok(actualizado);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        if (!productoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        productoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/{id}/descontar")
    public ResponseEntity<?> descontarStock(
            @PathVariable Long id,
            @RequestParam Integer cantidad) {

        if (cantidad == null || cantidad <= 0) {
            return ResponseEntity.badRequest()
                    .body("La cantidad debe ser mayor que cero");
        }

        return productoRepository.findById(id)
                .map(producto -> {
                    if (producto.getCantidad() < cantidad) {
                        return ResponseEntity.badRequest()
                                .body("Stock insuficiente. Disponible: "
                                        + producto.getCantidad());
                    }

                    producto.setCantidad(
                            producto.getCantidad() - cantidad
                    );

                    Producto actualizado = productoRepository.save(producto);
                    return ResponseEntity.ok(actualizado);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}
