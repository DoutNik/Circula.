# Salida a App Store y Google Play

El proyecto actual es una aplicación web/PWA. Para distribuirla en las
tiendas se debe crear y probar un contenedor nativo (por ejemplo, Capacitor)
para Android e iOS; no basta con subir la carpeta `dist`.

## Trabajo requerido antes de enviar a revisión

1. Crear el proyecto nativo, configurar identificadores únicos de paquete,
   iconos, pantallas de inicio, firma Android y certificados/profiles de iOS.
2. Abrirlo y probarlo en dispositivos físicos con Android Studio y Xcode,
   incluidos login Google/Firebase, cámara/galería, deep links, notificaciones
   y borrado de cuenta.
3. Crear cuentas Apple Developer y Google Play Console, completar ficha,
   clasificación de contenido, países, contacto de soporte, URL de privacidad
   y Data Safety/App Privacy con datos veraces.
4. Mantener el mecanismo público de borrado de cuenta:
   `https://circula.com.ar/#/eliminar-cuenta`.
5. Mantener denuncia, bloqueo, moderación y un equipo/canal para responder a
   reportes de contenido generado por usuarios.

## Premium y compras digitales

La suscripción Premium desbloquea funciones digitales dentro de la app. En
las versiones distribuidas por las tiendas debe cobrarse mediante **Google
Play Billing** en Android y **StoreKit / In-App Purchase** en iOS. Mercado
Pago puede seguir usándose para la web, pero no sustituye esas compras dentro
de las apps de tienda.

Antes de desarrollar esa parte, definir productos, precios, renovaciones,
pruebas gratuitas, restauración de compras y la relación entre la compra de
cada tienda y el plan en la API. También se requiere verificación de recibos
en el backend y un proceso de soporte/reembolsos. No es seguro simular ese
flujo ni es posible crear los productos, certificados o contratos sin acceso a
las cuentas del titular.
