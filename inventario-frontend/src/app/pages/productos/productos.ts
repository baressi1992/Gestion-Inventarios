
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Producto, ProductoService } from '../../services/producto.service';

type Categoria = Producto['categoria'];

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos implements OnInit {
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

  constructor(
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    console.log('Iniciando carga de productos');

    this.productoService.obtenerProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      },
    });
  }

  get productosFiltrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(texto),
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
      alert('Ingresa un nombre, precio y cantidad válidos.');
      return;
    }

    const datosProducto = { nombre, precio, cantidad, categoria };

    const operacion = this.productoEditandoId !== null
      ? this.productoService.actualizarProducto(
          this.productoEditandoId,
          datosProducto,
        )
      : this.productoService.registrarProducto(datosProducto);

    operacion.subscribe({
      next: () => {
        this.cerrarFormulario();
        this.cargarProductos();
      },
      error: (error) => {
        console.error('Error al guardar el producto:', error);
        alert(
          this.productoEditandoId !== null
            ? 'No se pudo actualizar el producto.'
            : 'No se pudo registrar el producto.',
        );
      },
    });
  }

  eliminarProducto(id: number): void {
    if (!confirm('¿Deseas eliminar este producto?')) {
      return;
    }

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
