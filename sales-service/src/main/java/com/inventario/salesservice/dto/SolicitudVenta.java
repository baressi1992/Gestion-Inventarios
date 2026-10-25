package com.inventario.salesservice.dto;

import java.util.List;

public class SolicitudVenta {

    private List<ProductoVentaRequest> productos;

    public SolicitudVenta() {
    }

    public List<ProductoVentaRequest> getProductos() {
        return productos;
    }

    public void setProductos(List<ProductoVentaRequest> productos) {
        this.productos = productos;
    }

    public static class ProductoVentaRequest {

        private Long productoId;
        private String nombreProducto;
        private Integer cantidad;
        private java.math.BigDecimal precioUnitario;

        public ProductoVentaRequest() {
        }

        public Long getProductoId() {
            return productoId;
        }

        public void setProductoId(Long productoId) {
            this.productoId = productoId;
        }

        public String getNombreProducto() {
            return nombreProducto;
        }

        public void setNombreProducto(String nombreProducto) {
            this.nombreProducto = nombreProducto;
        }

        public Integer getCantidad() {
            return cantidad;
        }

        public void setCantidad(Integer cantidad) {
            this.cantidad = cantidad;
        }

        public java.math.BigDecimal getPrecioUnitario() {
            return precioUnitario;
        }

        public void setPrecioUnitario(java.math.BigDecimal precioUnitario) {
            this.precioUnitario = precioUnitario;
        }
    }
}
