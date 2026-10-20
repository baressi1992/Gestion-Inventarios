import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';


type Categoria = 'Alimentos' | 'Bebidas' | 'Limpieza' | 'Otros';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  categoria: Categoria;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
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
        console.log('Productos recibidos:', productos);
        this.productos = productos;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los productos:', error);
        alert('No se pudieron cargar los productos.');
      },
    });
  }

  productos: Producto[] = [];

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
    console.log('Texto de búsqueda:', texto);
    console.log('Productos antes del filtro:', this.productos);
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
    this.formulario = { ...this.formulario, categoria };
  }

  abrirFormulario(): void {
    this.productoEditandoId = null;
    this.formulario = {
      nombre: '',
      precio: '',
      cantidad: '',
      categoria: 'Otros',
    };
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

    const datosProducto = {
      nombre,
      precio,
      cantidad,
      categoria,
    };

    if (this.productoEditandoId !== null) {
      this.productoService.actualizarProducto(this.productoEditandoId, datosProducto).subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarFormulario();
        },
        error: (error) => {
          console.error('Error al actualizar el producto:', error);
          alert('No se pudo actualizar el producto.');
        },
      });
    } else {
      this.productoService.registrarProducto(datosProducto).subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarFormulario();
        },
        error: (error) => {
          console.error('Error al registrar el producto:', error);
          alert('No se pudo registrar el producto.');
        },
      });
    }
  }

  eliminarProducto(id: number): void {
    const confirmado = confirm('¿Deseas eliminar este producto?');

    if (confirmado) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.cargarProductos();
        },
        error: (error) => {
          console.error('Error al eliminar el producto:', error);
          alert('No se pudo eliminar el producto.');
        },
      });
    }
  }
}
