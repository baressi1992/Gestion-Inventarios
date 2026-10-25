
import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Producto, ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  productos: Producto[] = [];

  constructor(
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
        console.error('Error al cargar los productos:', error);
      },
    });
  }

  get totalUnidades(): number {
    return this.productos.reduce(
      (total, producto) => total + producto.cantidad,
      0,
    );
  }

  get valorInventario(): number {
    return this.productos.reduce(
      (total, producto) => total + producto.precio * producto.cantidad,
      0,
    );
  }
}

