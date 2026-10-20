package com.inventario.inventoryservice.repository;

import com.inventario.inventoryservice.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
