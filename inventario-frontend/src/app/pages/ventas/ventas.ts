
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Producto, ProductoService } from '../../services/producto.service';
import {
  VentaService,
  VentaResponse,
} from '../../services/venta.service';

interface DetalleVenta {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas implements OnInit {
  productos: Producto[] = [];
  productosVenta: DetalleVenta[] = [];

  productoSeleccionadoId: number | null = null;
  cantidadSeleccionada = 1;
  error = '';

  registrandoVenta = false;
  mensajeExito = '';
  ventaRegistrada: VentaResponse | null = null;

  constructor(
    private ventaService: VentaService,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.error = 'No se pudo cargar el catálogo de productos.';
        this.cdr.markForCheck();
      },
    });
  }

  get productoSeleccionado(): Producto | undefined {
    return this.productos.find(
      (producto) => producto.id === this.productoSeleccionadoId,
    );
  }

  get totalVenta(): number {
    return this.productosVenta.reduce(
      (total, producto) =>
        total + producto.cantidad * producto.precioUnitario,
      0,
    );
  }

  get totalUnidades(): number {
    return this.productosVenta.reduce(
      (total, producto) => total + producto.cantidad,
      0,
    );
  }

  agregarProducto(): void {
    const producto = this.productoSeleccionado;
    const cantidad = Number(this.cantidadSeleccionada);

    if (!producto) {
      this.error = 'Selecciona un producto.';
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      this.error = 'La cantidad debe ser un entero mayor que cero.';
      return;
    }

    const existente = this.productosVenta.find(
      (item) => item.productoId === producto.id,
    );

    const cantidadActual = existente?.cantidad ?? 0;

    if (cantidadActual + cantidad > producto.cantidad) {
      this.error = `Stock disponible para ${producto.nombre}: ${
        producto.cantidad - cantidadActual
      } unidades.`;
      return;
    }

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.productosVenta = [
        ...this.productosVenta,
        {
          productoId: producto.id,
          nombreProducto: producto.nombre,
          cantidad,
          precioUnitario: producto.precio,
        },
      ];
    }

    this.error = '';
    this.cantidadSeleccionada = 1;
    this.cdr.markForCheck();
  }

  actualizarCantidad(productoId: number, nuevaCantidad: number): void {
    const item = this.productosVenta.find(
      (producto) => producto.productoId === productoId,
    );
    const producto = this.productos.find(
      (producto) => producto.id === productoId,
    );

    if (!item || !producto) return;

    const cantidad = Number(nuevaCantidad);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      this.error = 'La cantidad debe ser un entero mayor que cero.';
      this.cdr.markForCheck();
      return;
    }

    if (cantidad > producto.cantidad) {
      this.error = `Stock máximo disponible: ${producto.cantidad} unidades.`;
      this.cdr.markForCheck();
      return;
    }

    this.productosVenta = this.productosVenta.map((productoVenta) =>
      productoVenta.productoId === productoId
        ? { ...productoVenta, cantidad }
        : productoVenta,
    );

    this.error = '';
    this.cdr.markForCheck();
  }

  eliminarProducto(productoId: number): void {
    this.productosVenta = this.productosVenta.filter(
      (producto) => producto.productoId !== productoId,
    );

    this.error = '';
    this.cdr.markForCheck();
  }

  limpiarVenta(): void {
    this.productosVenta = [];
    this.error = '';
    this.cdr.markForCheck();
  }

  registrarVenta(): void {
    if (this.productosVenta.length === 0) {
      this.error = 'Agrega al menos un producto a la venta.';
      return;
    }

    if (this.registrandoVenta) {
      return;
    }

    const solicitud = {
      productos: this.productosVenta.map((producto) => ({
        productoId: producto.productoId,
        nombreProducto: producto.nombreProducto,
        cantidad: producto.cantidad,
        precioUnitario: producto.precioUnitario,
      })),
    };

    this.error = '';
    this.mensajeExito = '';
    this.ventaRegistrada = null;
    this.registrandoVenta = true;

    this.ventaService.registrarVenta(solicitud).subscribe({
      next: (respuesta) => {
        this.ventaRegistrada = respuesta;
        this.mensajeExito =
          `Venta #${respuesta.id} registrada correctamente.`;

        this.productosVenta = [];
        this.cantidadSeleccionada = 1;
        this.productoSeleccionadoId = null;
        this.registrandoVenta = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.error =
          error.error?.mensaje ??
          'No se pudo registrar la venta. Inténtalo nuevamente.';

        this.registrandoVenta = false;
        this.cdr.markForCheck();
      },
    });
  }
}
