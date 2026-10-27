# Despliegue: Cloudflare Pages + Render + Neon

Circula se publica en tres servicios independientes que se comunican por HTTPS:

```text
Usuarios → https://circula.com.ar       → Cloudflare Pages (frontend)
          https://api.circula.com.ar    → Render (API, chat y webhooks)
                                           ↓
                                         Neon (PostgreSQL)
```

Las URLs son deliberadamente distintas. El backend permite únicamente el
origen definido en `FRONTEND_URL`, por lo que hay que completar las variables
de los pasos siguientes antes de la salida pública.

## 1. Neon: base de datos

El repositorio incluye `neon.ts` y se vincula al proyecto
`flat-moon-17532804`, organización `org-dawn-frost-13234366`, rama
`production`. Desde la raíz:

```sh
neon login
neon init -y --no-agent-setup --org-id org-dawn-frost-13234366 --project-id flat-moon-17532804 --branch production --services postgres
neon deploy
npm run build
npm start
```

`neon deploy` configura PostgreSQL y descarga sus variables en `.env.local`
(o `.env` si existe); estos archivos están excluidos de Git. No publica el
frontend ni el proceso Node. La API carga primero las variables del hosting,
después los archivos de la raíz y finalmente `Server/.env.local` y
`Server/.env`. Usa `DATABASE_URL` también en desarrollo, con Sequelize y
`pg` sobre TCP y un pool máximo de cinco conexiones, con TLS y validación de
certificado. La sincronización de esquema usa `DATABASE_URL_UNPOOLED`; las
consultas de la API usan `DATABASE_URL`. Nunca agregar estas credenciales a
variables `VITE_*`.

Usar Node 22.12.0 (la versión declarada en el proyecto) o una versión compatible
posterior. Node 22.11.0 falla al cargar dependencias de Firebase Admin.
Para repetir la prueba con la API local en el puerto 3101:

```sh
node Server/scripts/verify-neon.js http://127.0.0.1:3101
```

La prueba verifica TLS, disponibilidad y creación/lectura/actualización/borrado
de una publicación mediante HTTP. Crea un usuario temporal y elimina los
registros de prueba al finalizar.

Neon ya está configurado. Copiar `DATABASE_URL` y `DATABASE_URL_UNPOOLED`
desde `.env.local` a las variables privadas de Render. No crear otra base de
datos ni copiar sus credenciales al frontend o al repositorio.

La API ejecuta la sincronización de las tablas al iniciar. Neon es la fuente
de datos persistente: Render no debe guardar datos ni archivos en su disco
local.

## 2. Render: API Node, Socket.IO y Mercado Pago

Crear una aplicación y un **Web Service** desde el repositorio Git:

Si el servicio anterior sigue existiendo, actualizarlo en lugar de crear otro.
Aplicar los ajustes de la tabla y cargar las variables de abajo. Para un servicio
nuevo también se puede usar **New → Blueprint** y seleccionar `render.yaml`.
El Blueprint define únicamente la API Free; no crea bases de datos ni servicios
pagos. Antes de aplicarlo a un servicio existente, hacer coincidir `name` con
el nombre real del servicio. Subir los cambios a la rama conectada a Render
antes de desplegar. Las variables marcadas `sync: false` se completan en el panel.

| Ajuste de Render | Valor |
| --- | --- |
| Runtime | Node |
| Rama | Rama de producción del repositorio |
| Root Directory | `Server` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Instance Type | **Free** |
| Health check | HTTP `GET /health` |
| Node | `22.12.0` |

Render proporciona `PORT` automáticamente; no lo agregues manualmente. El
servidor lo lee de forma nativa. `render.yaml` declara el comando de arranque
y las variables del servicio sin guardar secretos.

En **Settings → Environment variables**, definir estas variables. Los secretos
reales deben cargarse en Render, nunca en Git:

```text
NODE_ENV=production
DATABASE_URL=<cadena pooled de Neon>
DATABASE_URL_UNPOOLED=<cadena directa de Neon>
JWTSECRET=<secreto aleatorio largo>

# Usar primero las URLs temporales de Render/Pages; reemplazarlas por las
# canónicas de abajo al validar los dominios.
FRONTEND_URL=https://<tu-proyecto>.pages.dev
BACKEND_URL=https://<tu-api>.onrender.com

FIREBASE_SERVICE_ACCOUNT=<JSON completo de Firebase>
MAIL_PROVIDER=resend
RESEND_API_KEY=<clave de Resend>
MAIL_FROM=<remitente verificado en Resend>
CLOUD_NAME=
API_KEY=
API_SECRET=
ACCESS_TOKEN=APP_USR-...
MP_WEBHOOK_SECRET=
ADMIN_USERS=<tu-correo-admin>
```

Configurar el health check en `/health`, no en `/ready`: el primero confirma
que el proceso está vivo y el segundo confirma adicionalmente que Neon ya está
conectado. Tras desplegar, abrir:

```text
https://<tu-api>.onrender.com/health
https://<tu-api>.onrender.com/ready
```

Ambas rutas deben devolver `200` antes de publicar el cliente. Render admite
servicios HTTP y WebSocket, por lo que Socket.IO seguirá funcionando con la
misma URL de API.

## 3. Cloudflare Pages: frontend Vite

En Cloudflare: **Workers & Pages → Create application → Pages → Import an
existing Git repository**. Seleccionar el mismo repositorio y completar:

| Ajuste de Pages | Valor |
| --- | --- |
| Framework preset | React (Vite) |
| Production branch | Rama de producción |
| Root directory | `Client` |
| Build command | `pnpm install --frozen-lockfile && pnpm run build` |
| Build output directory | `dist` |

En **Settings → Environment variables → Production**, definir:

```text
NODE_VERSION=22.12.0
VITE_API_URL=https://<tu-api>.onrender.com
VITE_SOCKET_URL=https://<tu-api>.onrender.com
```

El proyecto ya incluye `packageManager: pnpm@11.25.0`, su lockfile y
[`Client/.node-version`](Client/.node-version). Las variables `VITE_*` se
incorporan al JavaScript durante el build: cualquier cambio exige un nuevo
despliegue de Pages.

## 4. Dominios definitivos

Cuando los dos despliegues temporales estén saludables:

1. En Cloudflare Pages, agregar `circula.com.ar` como dominio personalizado.
2. En Render, agregar `api.circula.com.ar` como dominio personalizado.
3. Crear los registros DNS exactamente como los pida cada plataforma. No usar
   valores de ejemplos ni registros viejos de Render.
4. Esperar la verificación TLS y DNS.
5. Reemplazar las variables con los valores definitivos:

En Render:

```text
FRONTEND_URL=https://circula.com.ar
BACKEND_URL=https://api.circula.com.ar
```

En Cloudflare Pages:

```text
VITE_API_URL=https://api.circula.com.ar
VITE_SOCKET_URL=https://api.circula.com.ar
```

Redeployar primero Render y después Cloudflare Pages. El archivo
[`Client/.env.production`](Client/.env.production) ya usa las URLs canónicas
como respaldo, pero las variables de Pages son la configuración efectiva de
producción.

## 5. Servicios externos posteriores

- En Firebase Authentication, autorizar `circula.com.ar` y el dominio temporal
  `pages.dev` usado durante las pruebas.
- En Mercado Pago, registrar el webhook definitivo:

  ```text
  https://api.circula.com.ar/plans/webhook
  ```

  Cargar el **Webhook signature secret** como `MP_WEBHOOK_SECRET` y el token
  de producción `APP_USR-...` como `ACCESS_TOKEN` en Render.
- Comprobar registro, login Google, publicaciones, imágenes, chat, bloqueo,
  denuncia, recuperación de contraseña, borrado de cuenta y un pago de prueba.

## Límites del plan gratuito

Render Free suspende la API tras 15 minutos sin tráfico HTTP o mensajes
WebSocket y puede tardar alrededor de un minuto en reactivarla. Las 750 horas
mensuales se comparten entre los servicios gratuitos del espacio de trabajo.

**Correo:** Render Free bloquea las conexiones SMTP por los puertos 25, 465 y
587. La app incluye una alternativa HTTPS con Resend: configurar
`MAIL_PROVIDER=resend`, `RESEND_API_KEY` y `MAIL_FROM` con un remitente de dominio
verificado. No alcanza con copiar las credenciales SMTP existentes. Sin esta
configuración no funcionan los correos de recuperación, eliminación de cuenta
y notificaciones; comprobar un envío real antes de habilitar esos flujos.
No se creó una cuenta ni se envió correo como parte de la configuración local.

Referencias: [límites oficiales de Render](https://render.com/docs/free) y
[API de correo de Resend](https://resend.com/docs/api-reference/emails/send-email).

Este conjunto sirve para beta y bajo tráfico. Revisar periódicamente los
límites de Render y Neon, mantener copias de seguridad de Neon y pasar a planes
pagos antes de depender de él para pagos o una comunidad activa.

La salida nativa a App Store y Google Play sigue descrita en
[`MOBILE_RELEASE.md`](MOBILE_RELEASE.md).
