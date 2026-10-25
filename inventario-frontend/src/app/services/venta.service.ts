
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetalleVentaRequest {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface VentaRequest {
  productos: DetalleVentaRequest[];
}

export interface DetalleVentaResponse extends DetalleVentaRequest {
  id: number;
  subtotal: number;
}

export interface VentaResponse {
  id: number;
  fecha: string;
  total: number;
  detalles: DetalleVentaResponse[];
}

export interface PaginaVentas {
  content: VentaResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class VentaService {
    private readonly apiUrl = 'http://localhost:8080/api/ventas';

    constructor(private http: HttpClient) {}
        registrarVenta(venta: VentaRequest): Observable<VentaResponse> {
            return this.http.post<VentaResponse>(this.apiUrl, venta);
    }

    obtenerVentas(
        pagina = 0,
        tamanio = 10,
        ): Observable<PaginaVentas> {
        return this.http.get<PaginaVentas>(
            `${this.apiUrl}?page=${pagina}&size=${tamanio}&sort=fecha,desc`,
        );
    }
}
