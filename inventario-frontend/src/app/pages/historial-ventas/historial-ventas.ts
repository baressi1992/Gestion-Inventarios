import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { VentaResponse, VentaService } from '../../services/venta.service';
import { LucideX } from '@lucide/angular';

@Component({
	selector: 'app-historial-ventas',
	standalone: true,
	imports: [CurrencyPipe, DatePipe, LucideX],
	templateUrl: './historial-ventas.html',
	styleUrl: './historial-ventas.css',
	})
export class HistorialVentas implements OnInit {
	ventas: VentaResponse[] = [];
	ventaSeleccionada: VentaResponse | null = null;
	paginaActual = 0;
	tamanioPagina = 10;
	totalPaginas = 0;
	totalVentas = 0;
	cargando = false;
	
	error = '';

	constructor(
		private ventaService: VentaService,
		private cdr: ChangeDetectorRef,
	) {}

	@ViewChild('dialogDetalle')
	dialogDetalle?: ElementRef<HTMLDialogElement>;

	ngOnInit(): void {
		this.obtenerVentas();
	}

	obtenerVentas(): void {
		this.cargando = true;
		this.error = '';

		this.ventaService
			.obtenerVentas(this.paginaActual, this.tamanioPagina)
			.subscribe({
			next: (pagina) => {
				this.ventas = pagina.content;
				this.paginaActual = pagina.number;
				this.totalPaginas = pagina.totalPages;
				this.totalVentas = pagina.totalElements;
				this.cargando = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Error al obtener ventas:', error);
				this.error = 'No se pudo cargar el historial de ventas.';
				this.cargando = false;
				this.cdr.markForCheck();
			},
		});
	}

	verDetalle(venta: VentaResponse): void {
		this.ventaSeleccionada = venta;
		setTimeout(() => {
			this.dialogDetalle?.nativeElement.showModal();
		});
	}

	cerrarDetalle(): void {
		this.dialogDetalle?.nativeElement.close();
		this.ventaSeleccionada = null;
	}

	irPaginaAnterior(): void {
		if (this.paginaActual > 0) {
			this.paginaActual--;
			this.obtenerVentas();
		}
	}

	irPaginaSiguiente(): void {
		if (this.paginaActual + 1 < this.totalPaginas) {
			this.paginaActual++;
			this.obtenerVentas();
		}
	}
	obtenerTotalUnidades(venta: VentaResponse): number {
		return venta.detalles.reduce(
			(total, detalle) => total + detalle.cantidad,
			0,
		);
	}
}

