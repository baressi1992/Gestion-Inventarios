import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

type Categoria = 'Alimentos' | 'Bebidas' | 'Limpieza' | 'Otros';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  categoria: Categoria;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  productos: Producto[] = [
    { id: 1, nombre: 'Arroz Costeño 1 kg', precio: 4.5, cantidad: 25, categoria: 'Alimentos' },
    { id: 2, nombre: 'Azúcar rubia 1 kg', precio: 4.0, cantidad: 18, categoria: 'Alimentos' },
    { id: 3, nombre: 'Aceite Primor 1 L', precio: 8.5, cantidad: 8, categoria: 'Alimentos' },
    { id: 4, nombre: 'Leche Gloria 400 g', precio: 4.2, cantidad: 20, categoria: 'Alimentos' },
    {
      id: 5,
      nombre: 'Fideos Don Vittorio 500 g',
      precio: 3.8,
      cantidad: 6,
      categoria: 'Alimentos',
    },
    { id: 6, nombre: 'Huevos (unidad)', precio: 0.7, cantidad: 60, categoria: 'Alimentos' },
    { id: 7, nombre: 'Agua mineral 625 ml', precio: 1.5, cantidad: 30, categoria: 'Bebidas' },
    { id: 8, nombre: 'Gaseosa Inca Kola 1.5 L', precio: 7.0, cantidad: 12, categoria: 'Bebidas' },
    { id: 9, nombre: 'Atún en conserva 170 g', precio: 5.8, cantidad: 9, categoria: 'Alimentos' },
    { id: 10, nombre: 'Jabón de tocador', precio: 3.5, cantidad: 15, categoria: 'Limpieza' },
  ];

  busqueda = '';
  mostrarFormulario = false;
  productoEditandoId: number | null = null;

  formulario = {
    nombre: '',
    precio: '',
    cantidad: '',
    categoria: 'Otros' as Categoria,
  };

  obtenerClaseCategoria(categoria: Categoria): string {
    switch (categoria) {
      case 'Alimentos':
        return 'categoria-alimentos';
      case 'Bebidas':
        return 'categoria-bebidas';
      case 'Limpieza':
        return 'categoria-limpieza';
      default:
        return 'categoria-otros';
    }
  }

  get productosFiltrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.productos.filter((producto) => producto.nombre.toLowerCase().includes(texto));
  }

  get totalUnidades(): number {
    return this.productos.reduce((total, producto) => total + producto.cantidad, 0);
  }

  get valorInventario(): number {
    return this.productos.reduce(
      (total, producto) => total + producto.precio * producto.cantidad,
      0,
    );
  }

  actualizarBusqueda(evento: Event): void {
    this.busqueda = (evento.target as HTMLInputElement).value;
  }

  actualizarCampo(campo: 'nombre' | 'precio' | 'cantidad', evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.formulario = { ...this.formulario, [campo]: valor };
  }

  actualizarCategoria(evento: Event): void {
    const categoria = (evento.target as HTMLSelectElement).value as Categoria;

    this.formulario = {
      ...this.formulario,
      categoria,
    };
  }

  abrirFormulario(): void {
    this.productoEditandoId = null;
    this.formulario = { nombre: '', precio: '', cantidad: '', categoria: 'Otros' };
    this.mostrarFormulario = true;
  }

  editarProducto(producto: Producto): void {
    this.productoEditandoId = producto.id;
    this.formulario = {
      nombre: producto.nombre,
      precio: String(producto.precio),
      cantidad: String(producto.cantidad),
      categoria: producto.categoria,
    };
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  guardarProducto(evento: Event): void {
    evento.preventDefault();

    const nombre = this.formulario.nombre.trim();
    const precio = Number(this.formulario.precio);
    const cantidad = Number(this.formulario.cantidad);
    const categoria = this.formulario.categoria;

    if (
      !nombre ||
      !Number.isFinite(precio) ||
      precio <= 0 ||
      !Number.isInteger(cantidad) ||
      cantidad < 0
    ) {
      return;
    }

    if (this.productoEditandoId !== null) {
      this.productos = this.productos.map((producto) =>
        producto.id === this.productoEditandoId
          ? { ...producto, nombre, precio, cantidad, categoria }
          : producto,
      );
    } else {
      const nuevoProducto: Producto = {
        id: Math.max(0, ...this.productos.map((producto) => producto.id)) + 1,
        nombre,
        precio,
        cantidad,
        categoria,
      };

      this.productos = [...this.productos, nuevoProducto];
    }

    this.cerrarFormulario();
  }

  eliminarProducto(id: number): void {
    const confirmado = confirm('¿Deseas eliminar este producto de la demostración?');

    if (confirmado) {
      this.productos = this.productos.filter((producto) => producto.id !== id);
    }
  }
}
