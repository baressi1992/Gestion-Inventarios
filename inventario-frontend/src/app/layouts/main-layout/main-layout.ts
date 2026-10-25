
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucidePackagePlus, LucideChartNoAxesColumn, LucideBadgeDollarSign, LucideSummary, LucideUser } from '@lucide/angular';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucidePackagePlus, LucideChartNoAxesColumn, LucideBadgeDollarSign, LucideSummary, LucideUser],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  menuAbierto = false;

  constructor(private router: Router) {}

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
    console.log(this.menuAbierto)
  }

  cerrarSesion(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');

    this.router.navigate(['/login']);
  }
}
