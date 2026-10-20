import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import  {Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  correo = '';
  password = '';
  mensajeError = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  iniciarSesion(evento: Event): void {
    evento.preventDefault();
    this.mensajeError = '';
    this.cargando = true;

    this.authService
      .iniciarSesion({
        correo: this.correo,
        password: this.password,
      })
      .subscribe({
        next: (respuesta) => {
          sessionStorage.setItem('token', respuesta.token);
          sessionStorage.setItem(
            'usuario',
            JSON.stringify({
              id: respuesta.id,
              nombre: respuesta.nombre,
              correo: respuesta.correo,
              rol: respuesta.rol,
            }),
          );

          this.cargando = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.cargando = false;
          this.mensajeError =
            error.status === 401
              ? 'Correo o contraseña incorrectos.'
              : 'No se pudo iniciar sesión. Verifica que el backend esté funcionando.';
        },
      });
  }
}
