# Despliegue en Render

El proyecto usa dos servicios: el backend Node/Express y el frontend estático
Vite. Configurar ambos con Node **22.12.0 o superior** y usar una única URL
canónica por servicio antes de publicar.

## Backend

Crear o actualizar un **Web Service** en Render con:

- Root directory: `Server`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/health`

Copiar las variables de `Server/.env` al panel de Environment de Render. El
archivo real está ignorado por Git y no se sube al repositorio. La plantilla
sin secretos está en [`Server/.env.example`](Server/.env.example). Además de
las URLs se requieren `DATABASE_URL`, `JWTSECRET`, `FIREBASE_SERVICE_ACCOUNT`,
las credenciales de correo y Cloudinary, y `ADMIN_USERS`.

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
válida cuando `NODE_ENV=production`. `/health` confirma que el proceso abrió
el puerto; `/ready` responde 200 solo después de que PostgreSQL esté listo.

## Frontend

Crear o actualizar un **Static Site** en Render con:

- Root directory: `Client`
- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm run build`
- Publish directory: `dist`

`Client/.env.production` contiene estas variables públicas que Vite incorpora
durante el build. La plantilla local es
[`Client/.env.example`](Client/.env.example):

```text
VITE_API_URL=https://circula-lj9f.onrender.com
VITE_SOCKET_URL=https://circula-lj9f.onrender.com
```

Si Render asigna una URL distinta al frontend, actualizar `FRONTEND_URL` del
backend antes de desplegar: controla CORS, Socket.IO, enlaces de recuperación y
las URLs de retorno de Mercado Pago.

El cliente usa `pnpm` y [`Client/pnpm-lock.yaml`](Client/pnpm-lock.yaml). El
antiguo `package-lock.json` se retiró para no mantener dos resoluciones de
dependencias distintas.

## Dominio

1. Agregar `circula.com.ar` y `www.circula.com.ar` en **Custom Domains** del
   Static Site de Render.
2. Crear en el proveedor del dominio exactamente los registros DNS que Render
   indique y esperar su verificación. Hasta que el DNS resuelva, el dominio no
   está listo para usuarios.
3. Una vez validado, establecer `FRONTEND_URL=https://circula.com.ar` en la
   API y volver a desplegarla. Volver a compilar el Static Site con la URL real
   de la API en ambas variables `VITE_*`.

La API solo acepta el origen indicado por `FRONTEND_URL`; esto es intencional
para proteger CORS y Socket.IO.

## Comprobación posterior

1. Confirmar que `GET /posts` responde desde el backend público.
2. Probar registro, login local y login de Google.
3. Solicitar recuperación de contraseña y abrir el enlace recibido.
4. Ejecutar un pago de prueba y comprobar que el webhook activa Premium.
5. Probar publicación, canje, chat, bloqueo, denuncia y resolución de denuncia
   desde el administrador.
6. Probar borrado de cuenta con sesión y desde `/#/eliminar-cuenta`.
7. Validar legalmente Términos y Política de Privacidad, completando identidad
   del titular, domicilio, edad mínima, jurisdicción y contacto oficial antes
   de aceptar usuarios reales.

## App Store y Google Play

La web/PWA queda separada de la publicación nativa. Para las tiendas hacen
falta un proyecto Android/iOS, cuentas y firmas de sus titulares, pruebas en
dispositivos, las fichas de privacidad, y cobro de Premium con Google Play
Billing y StoreKit/In-App Purchase (Mercado Pago queda para la web). El detalle
y la lista de preparación están en [`MOBILE_RELEASE.md`](MOBILE_RELEASE.md).
