package com.inventario.authservice.service;

import com.inventario.authservice.entity.Usuario;
import com.inventario.authservice.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario registrarUsuario(Usuario usuario) {

        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new IllegalArgumentException(
                    "El correo ya está registrado");
        }

        usuario.setPassword(
                passwordEncoder.encode(usuario.getPassword()));

        usuario.setRol("ROLE_USER");

        return usuarioRepository.save(usuario);
    }
}
