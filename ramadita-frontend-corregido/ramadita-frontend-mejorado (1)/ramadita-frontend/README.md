# La Ramadita — Frontend (React + Vite)

Migracion del frontend original (HTML/CSS/JS embebido en index.jsp) a
React, manteniendo el mismo diseño visual.

## Requisitos

- Node.js 18 o superior
- El backend (`ramadita-spring`) corriendo en `http://localhost:8080`

## Instalar dependencias

```bash
npm install
```

## Levantar en modo desarrollo

```bash
npm run dev
```

Se abre en `http://localhost:5173`. El archivo `vite.config.js` ya tiene
un proxy configurado para que las peticiones a `/api`, `/login` y
`/logout` se redirijan automaticamente al backend en el puerto 8080, asi
que no hay problemas de CORS en desarrollo.

## Generar build de produccion

```bash
npm run build
```

Esto genera la carpeta `dist/` con los archivos estaticos listos para
desplegar. Puedes:

- Servirlos con cualquier servidor estatico (nginx, Vercel, Netlify), o
- Copiarlos dentro de `src/main/resources/static/` del backend Spring Boot
  para que una sola aplicacion sirva todo (backend + frontend juntos).

## Estructura del proyecto

```
src/
├── api/          Cliente axios configurado con sesion por cookies
├── components/   Componentes reutilizables (Sidebar, Modal, MenuSelector, etc.)
├── context/      AuthContext (sesion) y ToastContext (notificaciones)
└── pages/        Las 8 paginas/modulos: Dashboard, Pedidos, Carta,
                  Cocina, Caja, Reportes, Inventario, Usuarios
```

## Modulos por rol

| Rol | Modulos visibles |
|---|---|
| ADMIN | Dashboard, Pedidos, Carta, Inventario, Cocina, Caja, Reportes, Usuarios |
| MESERO | Pedidos, Carta |
| CAJERO | Pedidos, Caja |
| COCINA | Cocina |

## Notas importantes

- La seguridad real (que rol puede hacer que) vive en el backend
  (Spring Security). Las restricciones en el frontend (`RutaProtegida`)
  son solo para ocultar opciones que el rol no podria usar, no son la
  proteccion real.
- Si cambias el puerto del backend, actualiza `vite.config.js`.
