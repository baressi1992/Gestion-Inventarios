package com.inventario.authservice.dto;

public class LoginResponse {

    private String token;
    private String tipo = "Bearer";
    private Long id;
    private String nombre;
    private String correo;
    private String rol;

    public LoginResponse() {
    }

    public LoginResponse(
            String token,
            Long id,
            String nombre,
            String correo,
            String rol) {
        this.token = token;
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.rol = rol;
    }

    public String getToken() {
        return token;
    }

    public String getTipo() {
        return tipo;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public String getRol() {
        return rol;
    }
}
