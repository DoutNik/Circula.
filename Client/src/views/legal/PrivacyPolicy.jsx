import { Link } from "react-router-dom";
import styles from "../../components/termsAndConditions/TermsAndConditions.module.css";

const sections = [
  [
    "Responsable y contacto",
    "Circula trata los datos necesarios para operar la plataforma de intercambio. Para consultas de privacidad, acceso, rectificación o supresión podés escribir a carlosklema@hotmail.com.",
  ],
  [
    "Datos que tratamos",
    "Al crear una cuenta se tratan nombre de usuario, correo, foto, ubicación y credenciales protegidas. También se tratan publicaciones, imágenes, mensajes, solicitudes de canje, reseñas, reportes, información técnica de seguridad y, si la autorizás, el token de notificaciones. Los pagos son procesados por Mercado Pago; Circula no almacena datos completos de tarjeta.",
  ],
  [
    "Finalidades y base de uso",
    "Usamos estos datos para crear y proteger cuentas, mostrar publicaciones, facilitar canjes y chats, gestionar Premium, prevenir fraude y abuso, atender solicitudes y cumplir obligaciones legales. El usuario puede retirar permisos opcionales de notificaciones desde su dispositivo.",
  ],
  [
    "Servicios que intervienen",
    "Firebase provee autenticación y notificaciones; Cloudinary aloja imágenes; Mercado Pago procesa pagos; Render y PostgreSQL alojan la aplicación y los datos. Cada proveedor puede tratar datos conforme a sus propias políticas y bajo las configuraciones contratadas por Circula.",
  ],
  [
    "Conservación y seguridad",
    "Los datos se conservan mientras la cuenta esté activa o exista una obligación legal. La eliminación de cuenta borra el perfil y los datos asociados de la base operativa; pueden subsistir copias de seguridad por un plazo técnico limitado. Aplicamos autenticación, control de acceso, límites de solicitudes y conexiones seguras, aunque ningún sistema puede garantizar seguridad absoluta.",
  ],
  [
    "Tus derechos y eliminación",
    "Podés solicitar acceso, rectificación o supresión. También podés eliminar tu cuenta desde tu perfil, o usar la página pública de eliminación si no podés iniciar sesión. La solicitud por correo no revela si una cuenta existe y requiere confirmación mediante un enlace enviado al correo registrado.",
  ],
  [
    "Contenido de usuarios",
    "Las publicaciones, reseñas y mensajes son aportados por usuarios. Ofrecemos denuncia y bloqueo; las denuncias son revisadas por administración. No publiques datos personales de terceros, contenido ilegal o material que infrinja derechos ajenos.",
  ],
];

export default function PrivacyPolicy() {
  return (
    <main className={styles.page}>
      <article className={styles.document}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>CIRCULA · PRIVACIDAD</p>
          <h1>Política de Privacidad</h1>
          <p className={styles.subtitle}>Vigente desde el 24 de octubre de 2026.</p>
        </header>
        <div className={styles.body}>
          {sections.map(([title, content]) => (
            <section className={styles.section} key={title}>
              <h2>{title}</h2>
              <p>{content}</p>
            </section>
          ))}
          <section className={styles.section}>
            <h2>Enlaces relacionados</h2>
            <p><Link to="/eliminar-cuenta">Solicitar eliminación de cuenta</Link></p>
            <p><Link to="/terminos-y-condiciones">Términos y condiciones</Link></p>
          </section>
        </div>
      </article>
    </main>
  );
}
