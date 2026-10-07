# La Ramadita — Backend (Spring Boot)

Migracion del sistema original (Servlets/JSP + JDBC) a Spring Boot 3 +
Spring Data JPA + Spring Security.

## Requisitos

- Java 17 o superior
- Maven (o usar el wrapper si lo agregas con `mvn -N wrapper:wrapper`)
- MySQL 8 corriendo localmente (o accesible por red)

## Configuracion de la base de datos

1. Crea la base de datos en MySQL:

```sql
CREATE DATABASE ramadita_db CHARACTER SET utf8mb4;
```

2. Las tablas se crean **automaticamente** al levantar la app gracias a
   `spring.jpa.hibernate.ddl-auto=update` (no es necesario correr los
   `.sql` del proyecto original).

3. Configura la conexion. Por defecto usa `root` / `root` en
   `localhost:3306/ramadita_db`. Para cambiarlo, define variables de
   entorno antes de levantar la app (recomendado para no exponer
   credenciales en el codigo):

```bash
export DB_URL="jdbc:mysql://localhost:3306/ramadita_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
export DB_USER="tu_usuario"
export DB_PASSWORD="tu_password"
```

   O edita directamente `src/main/resources/application.properties`.

## Levantar el proyecto

```bash
mvn spring-boot:run
```

La API queda disponible en `http://localhost:8080`.

## Crear el primer usuario administrador

El sistema no trae usuarios precargados. Para crear el primer admin,
inserta uno directamente en MySQL con una contrasena ya encriptada en
BCrypt. Puedes generar el hash en https://bcrypt-generator.com (cost 10)
o con un pequeno script Java/Python, y luego ejecutar:

```sql
INSERT INTO usuarios (nombre, usuario, contrasena, rol, activo)
VALUES ('Administrador', 'admin', '<hash_bcrypt_aqui>', 'ADMIN', 1);
```

A partir de ahi, puedes crear el resto de usuarios (mesero, cocina,
cajero) desde el modulo de Usuarios dentro de la aplicacion.

## Estructura del proyecto

```
src/main/java/com/ramadita/
├── entity/       Entidades JPA (Usuario, Plato, Pedido, DetallePedido, Inventario)
├── repository/   Spring Data JPA Repositories
├── service/      Logica de negocio
├── controller/   Endpoints REST (/api/...)
├── security/     Spring Security (login, roles, BCrypt)
└── dto/          Objetos de transferencia (requests/responses)
```

## Endpoints principales

Ver el detalle completo en los comentarios de cada `*Controller.java`.
Resumen:

| Endpoint | Metodo | Roles |
|---|---|---|
| `/login` | POST | Publico |
| `/logout` | POST | Autenticado |
| `/api/auth/me` | GET | Autenticado |
| `/api/carta` | GET/POST | Ver: todos. Editar: ADMIN |
| `/api/pedidos/registrar` | POST | ADMIN, MESERO |
| `/api/pedidos/{id}/cobrar` | POST | ADMIN, MESERO, CAJERO |
| `/api/pedidos/{id}/estado` | POST | ADMIN, COCINA |
| `/api/pedidos/caja` | GET | ADMIN, MESERO, CAJERO |
| `/api/pedidos/historial` | GET | ADMIN |
| `/api/inventario` | GET/POST | ADMIN |
| `/api/usuarios` | GET/POST | ADMIN |

## Notas importantes

- Las contrasenas se guardan con hash BCrypt (no texto plano, a diferencia
  del proyecto original).
- CSRF esta deshabilitado para simplificar la integracion con el frontend
  React. Si esto va a produccion seria con datos sensibles reales, valdria
  la pena revisar esto con mas detalle.
- La sesion se maneja con cookies (`JSESSIONID`), por eso el frontend debe
  mandar `withCredentials: true` en cada peticion.
