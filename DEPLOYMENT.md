# Despliegue en Render

El proyecto usa dos servicios: el backend Node/Express y el frontend estático
Vite. El backend ya está configurado para responder desde
`https://circula-lj9f.onrender.com` y el frontend para consumir esa API.

## Backend

Crear o actualizar un **Web Service** en Render con:

- Root directory: `Server`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/users/verify` no es público; usar `/posts` si Render
  requiere una ruta de health check.

Copiar las variables de `Server/.env` al panel de Environment de Render. El
archivo real está ignorado por Git y no se sube al repositorio. La plantilla
sin secretos está en `Server/.env.example`.

Mantener estos valores públicos:

```text
NODE_ENV=production
FRONTEND_URL=https://circula-pvpn.onrender.com
BACKEND_URL=https://circula-lj9f.onrender.com
```

Se deben obtener manualmente desde Mercado Pago antes de publicar:

- `ACCESS_TOKEN`: token de producción que comienza por `APP_USR-`.
- `MP_WEBHOOK_SECRET`: el valor **Webhook signature secret** del panel de
  Mercado Pago para `https://circula-lj9f.onrender.com/plans/webhook`.

No usar tokens `TEST-` en producción. El webhook rechaza llamadas sin firma
válida cuando `NODE_ENV=production`.

## Frontend

Crear o actualizar un **Static Site** en Render con:

- Root directory: `Client`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

`Client/.env.production` contiene estas variables públicas que Vite incorpora
durante el build:

```text
VITE_API_URL=https://circula-lj9f.onrender.com
VITE_SOCKET_URL=https://circula-lj9f.onrender.com
```

Si Render asigna una URL distinta al frontend, actualizar `FRONTEND_URL` del
backend antes de desplegar: controla CORS, Socket.IO, enlaces de recuperación y
las URLs de retorno de Mercado Pago.

## Comprobación posterior

1. Confirmar que `GET /posts` responde desde el backend público.
2. Probar registro, login local y login de Google.
3. Solicitar recuperación de contraseña y abrir el enlace recibido.
4. Ejecutar un pago de prueba y comprobar que el webhook activa Premium.
