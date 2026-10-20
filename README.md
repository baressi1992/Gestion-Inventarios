# Sistema de Gestión de Inventarios

Sistema web para la gestión de productos de un minimarket, desarrollado como proyecto académico utilizando una arquitectura de microservicios. Permite administrar productos y gestionar el acceso de los usuarios mediante autenticación con JWT.

## Tecnologías utilizadas

### Backend
- **Java 21**
- **Spring Boot**
- **Spring Data JPA** para el acceso a datos
- **Spring Security** para la seguridad de la aplicación
- **JWT (JSON Web Token)** para la autenticación
- **Eureka Server** para el registro y descubrimiento de microservicios
- **Spring Cloud Gateway** como punto de entrada a la API
- **Maven** para la gestión de dependencias

### Frontend
- **Angular**
- **TypeScript**
- **HTML y CSS**

### Base de datos
- **MySQL**

## Arquitectura del proyecto

El sistema está organizado en los siguientes componentes:

| Componente | Puerto | Descripción |
|---|---:|---|
| `eureka-server` | 8761 | Registra y permite descubrir los microservicios. |
| `api-gateway` | 8080 | Centraliza las solicitudes del frontend y las dirige a los servicios correspondientes. |
| `auth-service` | 8081 | Gestiona el registro, el inicio de sesión y la autenticación de usuarios. |
| `inventory-service` | 8082 | Gestiona las operaciones relacionadas con los productos del inventario. |
| `inventario-frontend` | Configurable | Interfaz web desarrollada con Angular. |

Los servicios backend utilizan la base de datos MySQL `gestion_inventarios`.

## Funcionalidades principales

- Registro de usuarios.
- Inicio de sesión mediante correo electrónico y contraseña.
- Generación y validación de tokens JWT.
- Protección de los endpoints que requieren autenticación.
- Registro, consulta, actualización y eliminación de productos.
- Comunicación con los servicios backend mediante API REST.
- Registro y descubrimiento de microservicios con Eureka.
- Enrutamiento de solicitudes a través del API Gateway.
- Persistencia de información en MySQL.
- Interfaz web para la gestión del inventario.

## Estructura del proyecto

```text
Gestion-Inventarios/
├── api-gateway/
├── auth-service/
├── eureka-server/
├── inventory-service/
├── inventario-frontend/
└── README.md
```

## Requisitos previos

Antes de ejecutar el proyecto, es necesario contar con:

- JDK 21.
- IntelliJ IDEA u otro IDE compatible con Spring Boot.
- MySQL Server.
- Node.js y npm.
- Angular CLI compatible con la versión de Angular del frontend.
- Git, para clonar y administrar el repositorio.

## Configuración de la base de datos

1. Iniciar el servidor MySQL.
2. Crear la base de datos:

```sql
CREATE DATABASE gestion_inventarios;
```

3. Configurar las variables de entorno necesarias para la conexión a MySQL y la autenticación JWT.

No se deben publicar contraseñas ni claves secretas en el repositorio.

Variables utilizadas por los servicios backend:

- `DB_USERNAME`: usuario de MySQL.
- `DB_PASSWORD`: contraseña de MySQL.
- `JWT_SECRET`: clave secreta utilizada para firmar y validar los tokens JWT.

Estas variables deben configurarse en el entorno de ejecución de cada servicio que las necesite.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/baressi1992/Gestion-Inventarios.git
cd Gestion-Inventarios
```

### 2. Configurar las variables de entorno

Configurar `DB_USERNAME`, `DB_PASSWORD` y `JWT_SECRET` en las configuraciones de ejecución de IntelliJ IDEA o en el entorno utilizado para ejecutar cada microservicio.

Utilizar la misma clave JWT en los servicios que deban validar los mismos tokens.

### 3. Ejecutar los microservicios

Abrir el proyecto en IntelliJ IDEA y ejecutar las aplicaciones Spring Boot en este orden:

1. `eureka-server`
2. `auth-service`
3. `inventory-service`
4. `api-gateway`

Verificar que Eureka esté disponible en:

http://localhost:8761/

El frontend y los microservicios deben estar configurados para utilizar las direcciones y los puertos correspondientes.

### 4. Ejecutar el frontend Angular

Abrir una terminal en la carpeta del frontend:

```bash
cd inventario-frontend
npm install
ng serve
```

Después, abrir en el navegador la dirección local que indique Angular CLI, normalmente:

http://localhost:4200/

## API REST

Las solicitudes del frontend se realizan a través del API Gateway.

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/auth/registro` | Registrar un usuario. |
| `POST` | `/api/auth/login` | Iniciar sesión. |
| `GET` | `/api/productos` | Consultar productos; requiere autenticación. |

Las operaciones de actualización y eliminación de productos también se gestionan mediante el API Gateway. Los endpoints protegidos requieren un token JWT válido.

