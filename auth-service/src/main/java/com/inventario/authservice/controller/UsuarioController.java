package com.inventario.authservice.controller;

import com.inventario.authservice.entity.Usuario;
import com.inventario.authservice.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.inventario.authservice.dto.LoginRequest;
import com.inventario.authservice.dto.LoginResponse;
import com.inventario.authservice.service.AuthService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthService authService;

    public UsuarioController(
            UsuarioService usuarioService,
            AuthService authService) {

        this.usuarioService = usuarioService;
        this.authService = authService;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(
            @RequestBody Usuario usuario) {

        try {
            Usuario guardado =
                    usuarioService.registrarUsuario(usuario);

            Map<String, Object> respuesta =
                    new LinkedHashMap<>();

            respuesta.put("id", guardado.getId());
            respuesta.put("nombre", guardado.getNombre());
            respuesta.put("correo", guardado.getCorreo());
            respuesta.put("rol", guardado.getRol());
            respuesta.put("mensaje",
                    "Usuario registrado correctamente");

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(respuesta);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(
            @RequestBody LoginRequest request) {

        try {
            LoginResponse respuesta =
                    authService.iniciarSesion(request);

            return ResponseEntity.ok(respuesta);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfil() {

        Authentication autenticacion =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        Map<String, Object> perfil = new LinkedHashMap<>();

        perfil.put("correo", autenticacion.getName());
        perfil.put("autenticado", autenticacion.isAuthenticated());
        perfil.put("mensaje", "Acceso autorizado mediante Spring Security");

        return ResponseEntity.ok(perfil);
    }

}
