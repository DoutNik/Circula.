import React from "react";
import styles from "./TermsAndConditions.module.css";

const sections = [
  {
    title: "1. Identificación y objeto",
    paragraphs: [
      "Circula es una plataforma digital destinada a facilitar el intercambio de productos entre usuarios, sin que el dinero sea el medio principal de la operación. Su finalidad es conectar personas interesadas en intercambiar bienes que poseen por otros que desean obtener.",
      "La plataforma es administrada por una persona física. Los datos completos de identificación del titular, domicilio legal y canal oficial de contacto deberán incorporarse antes de la publicación definitiva de este documento.",
      "Estos Términos y Condiciones regulan el acceso y la utilización de Circula, la creación de cuentas, la publicación de productos, la generación de coincidencias o matches, la comunicación entre usuarios y la contratación de funcionalidades Premium.",
      "Al registrarse o utilizar Circula, el usuario declara haber leído y comprendido estas condiciones. Cuando la legislación exija un consentimiento específico, este deberá recabarse de manera expresa y separada."
    ]
  },
  {
    title: "2. Definiciones",
    bullets: [
      ["Circula o la Plataforma:", " la aplicación y sus funcionalidades disponibles."],
      ["Titular:", " la persona física responsable de administrar Circula."],
      ["Usuario:", " toda persona que accede a la Plataforma y utiliza sus servicios."],
      ["Publicación:", " el anuncio de un producto que un usuario ofrece para intercambiar."],
      ["Interés o like:", " la manifestación de interés de un usuario en una publicación."],
      ["Match:", " la coincidencia que se genera cuando existe interés mutuo entre productos publicados por distintos usuarios."],
      ["Canje:", " el acuerdo privado por el cual dos usuarios deciden intercambiar los productos involucrados."],
      ["Premium:", " la suscripción paga que habilita funcionalidades adicionales."],
      ["Contenido:", " las fotografías, descripciones, mensajes y demás materiales incorporados por los usuarios."]
    ]
  },
  {
    title: "3. Aceptación y modificaciones",
    paragraphs: [
      "El uso de Circula implica la aceptación de estos Términos y Condiciones y de la Política de Privacidad aplicable.",
      "El Titular podrá modificar las funcionalidades de la Plataforma y actualizar estos términos por motivos operativos, técnicos, legales o de seguridad. Las modificaciones sustanciales deberán comunicarse de forma adecuada y, cuando corresponda, requerirán una nueva aceptación.",
      "Las modificaciones no podrán suprimir derechos que la legislación aplicable reconozca a los usuarios ni aplicarse retroactivamente en perjuicio de derechos ya adquiridos.",
      "La versión vigente deberá estar disponible para su consulta dentro de la Plataforma."
    ]
  },
  {
    title: "4. Registro y cuenta de usuario",
    paragraphs: [
      "Para utilizar las funcionalidades que requieren autenticación, el usuario deberá crear una cuenta y proporcionar información veraz, actualizada y suficiente para el funcionamiento del servicio.",
      "Circula puede permitir el acceso mediante servicios de autenticación de terceros, como Google o Facebook, según las opciones habilitadas en cada momento.",
      "El usuario es responsable de mantener la confidencialidad de sus credenciales y de comunicar cualquier uso no autorizado de su cuenta. No deberá compartir sus credenciales ni utilizar la cuenta de otra persona sin autorización.",
      "Cada usuario deberá utilizar la Plataforma de buena fe y no podrá crear cuentas con fines fraudulentos, suplantar identidades ni proporcionar deliberadamente información engañosa.",
      "El Titular podrá adoptar medidas razonables para proteger las cuentas, prevenir abusos y preservar la seguridad de la comunidad."
    ]
  },
  {
    title: "5. Edad y participación de menores",
    paragraphs: [
      "Circula está inicialmente orientada al uso en Argentina. La participación de menores de edad deberá ajustarse a las normas sobre capacidad progresiva, representación legal, protección de niñas, niños y adolescentes y tratamiento de sus datos personales.",
      "La política definitiva de edad queda pendiente de validación jurídica. Hasta que se establezcan e implementen mecanismos adecuados, no deberá interpretarse este documento como una autorización irrestricta para que cualquier menor se registre o realice canjes.",
      "Cuando se permita la participación de menores, podrán exigirse las autorizaciones correspondientes de sus representantes legales, según la edad, la naturaleza del acto y la legislación aplicable. Los representantes deberán supervisar las operaciones cuando corresponda.",
      "No se permitirá utilizar Circula para contactar, engañar, explotar, acosar o poner en riesgo a menores. El Titular podrá retirar contenido o restringir cuentas cuando existan motivos razonables de protección."
    ]
  },
  {
    title: "6. Publicación de productos",
    paragraphs: [
      "Los usuarios podrán publicar productos de distintas categorías, siempre que su oferta sea lícita y respete estos términos y la legislación vigente.",
      "Cada publicación deberá describir el producto de forma suficientemente clara e incluir fotografías representativas. El usuario deberá informar, en la medida en que corresponda, su estado, defectos relevantes, características, accesorios y cualquier circunstancia que pueda influir razonablemente en la decisión de la otra persona.",
      "El usuario declara que tiene derecho a ofrecer el producto y que su publicación no infringe derechos de terceros.",
      "No podrá publicar productos robados, de origen ilícito, falsificados cuando su comercialización infrinja la ley, ni bienes cuya tenencia, circulación, transferencia o intercambio estén prohibidos o sujetos a restricciones que el usuario no esté autorizado a cumplir.",
      "El usuario no deberá presentar como nuevo un producto usado, ocultar defectos relevantes ni utilizar fotografías o descripciones engañosas.",
      "La publicación de un producto no implica que Circula haya comprobado su existencia, titularidad, autenticidad, estado o legalidad."
    ]
  },
  {
    title: "7. Contenido prohibido y usos indebidos",
    intro: "Se prohíbe utilizar Circula para publicar, ofrecer, solicitar, intercambiar o promover:",
    bullets: [
      ["a.", " Bienes robados, sustraídos o de procedencia ilícita."],
      ["b.", " Drogas ilegales, sustancias controladas cuya transferencia esté prohibida o productos destinados a facilitar actividades ilícitas."],
      ["c.", " Armas, municiones, explosivos u otros artículos cuya oferta o transferencia infrinja la legislación aplicable."],
      ["d.", " Productos falsificados o que infrinjan derechos de propiedad intelectual o industrial."],
      ["e.", " Material de explotación sexual, abuso sexual infantil o contenido sexual ilícito."],
      ["f.", " Bienes cuya circulación o intercambio estén prohibidos por las autoridades competentes."],
      ["g.", " Contenido que amenace, acose, discrimine ilegalmente, extorsione o incite a cometer delitos."],
      ["h.", " Información personal de terceros publicada sin autorización o sin otra base legítima."],
      ["i.", " Publicidad engañosa, estafas, suplantaciones de identidad o intentos de obtener credenciales, datos financieros o información confidencial mediante engaño."],
      ["j.", " Contenido que infrinja derechos de autor, marcas, imagen, intimidad u otros derechos de terceros."]
    ],
    paragraphs: [
      "El Titular podrá retirar publicaciones, limitar funcionalidades o suspender cuentas ante indicios razonables de infracción, fraude, riesgo para otros usuarios o incumplimiento de estos términos. Cuando resulte necesario, podrá conservar y comunicar información conforme a la legislación aplicable y a requerimientos legítimos de las autoridades."
    ]
  },
  {
    title: "8. Funcionamiento de los intereses y los matches",
    paragraphs: [
      "Circula permite que un usuario manifieste interés en un producto publicado por otra persona. El usuario interesado también puede tener publicado un producto que desea ofrecer a cambio.",
      "Cuando existe interés mutuo entre dos publicaciones, la Plataforma genera un match para poner en contacto a los usuarios.",
      "El match indica únicamente que existe interés recíproco. No constituye una aceptación definitiva del canje, una reserva, una garantía de entrega ni una certificación de que los productos sean equivalentes o estén disponibles.",
      "En la versión actual de Circula, la Plataforma no registra una aceptación final del intercambio ni certifica que el canje se haya completado.",
      "Los usuarios deberán conversar y acordar voluntariamente los términos de la operación, incluyendo el producto concreto, su estado, la forma y el lugar de entrega y cualquier otra condición relevante.",
      "El funcionamiento actual está diseñado para intercambiar los dos productos que protagonizan el match. Si los usuarios desean acordar productos adicionales o compensaciones por fuera de ese mecanismo, deberán hacerlo bajo su propia responsabilidad y sin atribuir a Circula funciones que la Plataforma no ofrece.",
      "Las futuras funcionalidades de compensación monetaria o de intercambio de varios productos, si se incorporan, podrán estar sujetas a condiciones adicionales."
    ]
  },
  {
    title: "9. Negociaciones y responsabilidad de los usuarios",
    paragraphs: [
      "Circula actúa como una plataforma de conexión y comunicación entre usuarios. No compra, vende, recibe, almacena, inspecciona ni entrega los productos objeto de los canjes, salvo que en el futuro se informe expresamente una funcionalidad diferente.",
      "Los usuarios son responsables de:"
    ],
    bullets: [
      ["•", " Verificar que el producto ofrecido exista y coincida razonablemente con su descripción."],
      ["•", " Acordar las condiciones del canje antes de entregar o recibir un producto."],
      ["•", " Comprobar, dentro de lo razonable, la identidad y legitimidad de la contraparte."],
      ["•", " Elegir lugares y métodos de entrega seguros."],
      ["•", " Cumplir las normas aplicables a la tenencia y transferencia de los productos."],
      ["•", " Evitar compartir datos personales, financieros o de acceso que no sean necesarios para el intercambio."]
    ],
    paragraphs2: [
      "Se recomienda revisar el producto antes de completar la entrega, dejar constancia de las condiciones acordadas y evitar encuentros en lugares aislados.",
      "Circula no verifica sistemáticamente la identidad de los usuarios ni certifica los productos publicados. La Plataforma tampoco garantiza que otro usuario cumpla sus promesas, que un producto sea auténtico o que el canje llegue a concretarse.",
      "Estas limitaciones describen el funcionamiento del servicio, pero no excluyen responsabilidades que legalmente correspondan al Titular ni restringen derechos irrenunciables de los usuarios."
    ]
  },
  {
    title: "10. Mensajes y comunicaciones",
    paragraphs: [
      "Circula puede ofrecer herramientas de mensajería para facilitar la comunicación relacionada con los matches y los canjes.",
      "Los usuarios deberán utilizar estas herramientas de forma respetuosa, lícita y vinculada a los fines de la Plataforma.",
      "Se prohíbe emplear los mensajes para amenazar, acosar, estafar, difundir contenido ilegal, suplantar identidades o distribuir enlaces maliciosos.",
      "Los usuarios deben considerar que los mensajes pueden contener información personal y evitar compartir datos sensibles o información de terceros sin una base legítima.",
      "La existencia de una conversación no significa que Circula haya validado las afirmaciones de sus participantes ni que garantice el cumplimiento de lo acordado."
    ]
  },
  {
    title: "11. Moderación y medidas sobre las cuentas",
    paragraphs: [
      "El Titular puede revisar publicaciones y cuentas, retirar contenido y desactivar cuentas cuando identifique incumplimientos de estos términos, actividad fraudulenta, riesgos de seguridad o requerimientos legales.",
      "La moderación disponible actualmente es limitada: el administrador puede revisar publicaciones y usuarios y desactivarlos cuando corresponda. Circula no dispone actualmente de un procedimiento formal y completo de apelación contra suspensiones.",
      "La ausencia de un procedimiento formal de apelación no impide que el usuario contacte al Titular para solicitar información o revisión de una medida, cuando exista un canal de contacto habilitado.",
      "Cuando sea razonablemente posible y no exista una razón legal, de seguridad o de prevención del fraude que lo impida, se procurará informar al usuario el motivo de una medida relevante.",
      "El Titular podrá retirar temporalmente una publicación mientras verifica una posible infracción. Las medidas deberán adoptarse de forma razonable y sin perjuicio de los derechos legalmente reconocidos."
    ]
  },
  {
    title: "12. Suscripción Premium",
    paragraphs: [
      "Circula ofrece una suscripción Premium de pago, con cobro recurrente a través de Mercado Pago, que habilita las siguientes funcionalidades:"
    ],
    bullets: [
      ["a.", " Consultar quién manifestó interés en los productos del usuario y qué producto ofrece a cambio, según las funcionalidades disponibles en la Plataforma."],
      ["b.", " Publicar una cantidad ilimitada de productos, de acuerdo con las condiciones del plan vigente."]
    ],
    paragraphs2: [
      "El alcance de Premium será el que se informe claramente antes de contratar. El Titular podrá modificar las funcionalidades para el futuro, respetando las condiciones contratadas y los derechos de los suscriptores.",
      "El precio, la moneda, la periodicidad exacta del cobro, la fecha de renovación, las condiciones de cualquier período de prueba y las demás condiciones comerciales deberán mostrarse de manera clara antes de confirmar el pago.",
      "La contratación de Premium no garantiza que otros usuarios manifiesten interés, que se generen matches ni que se complete un canje."
    ]
  },
  {
    title: "13. Pagos, renovación, cancelación y reembolsos",
    paragraphs: [
      "Los pagos de Premium se procesan mediante Mercado Pago y están sujetos a las condiciones del medio de pago y a las condiciones informadas durante la contratación.",
      "La suscripción tiene carácter recurrente cuando así se indique en la oferta y se renueva conforme al período informado, salvo que sea cancelada.",
      "El usuario debe disponer de un medio válido de pago y revisar las condiciones de renovación antes de confirmar la suscripción.",
      "La cancelación deberá poder solicitarse mediante un mecanismo accesible y conforme a la legislación aplicable. Cuando la contratación se haya realizado electrónicamente, deberán respetarse los derechos de rescisión por medios electrónicos que correspondan. Si la Plataforma no ofrece actualmente una opción interna de cancelación, deberá indicarse un canal alternativo claro y efectivo, sin perjuicio de los mecanismos que permita Mercado Pago.",
      "El usuario podrá solicitar asistencia para cancelar la suscripción a través del canal de contacto oficial que el Titular habilite. El procedimiento definitivo deberá precisarse antes de publicar estos términos.",
      "La cancelación impedirá futuras renovaciones según las condiciones aplicables, pero no implica necesariamente la devolución automática de importes ya cobrados.",
      "No se ofrecerán reembolsos voluntarios como política general, sin perjuicio del derecho de revocación, devolución, reintegro, desconocimiento de cargos u otros derechos que resulten obligatorios conforme a la legislación aplicable o a las condiciones de Mercado Pago. Ninguna disposición de esta sección debe interpretarse como una renuncia anticipada a derechos irrenunciables del consumidor.",
      "El tratamiento de cobros duplicados, pagos no autorizados, errores de facturación o interrupciones de las funcionalidades Premium deberá realizarse conforme a la normativa aplicable y a las circunstancias del caso."
    ]
  },
  {
    title: "14. Suspensión, baja y eliminación de cuentas",
    paragraphs: [
      "El usuario podrá dejar de utilizar Circula y solicitar la eliminación de su cuenta por el procedimiento que la Plataforma habilite.",
      "La intención operativa actual es que la eliminación de una cuenta también elimine el perfil y las publicaciones asociadas. La implementación técnica y los plazos de eliminación deberán confirmarse antes de publicar este documento.",
      "La eliminación de la cuenta no implica necesariamente que toda información relacionada desaparezca de forma inmediata de copias de seguridad, registros técnicos, sistemas de terceros o conversaciones de otros usuarios. La retención y eliminación de esos datos deberán ajustarse a la Política de Privacidad y a las obligaciones legales aplicables.",
      "El Titular podrá suspender o desactivar cuentas ante incumplimientos de estos términos o riesgos relevantes para la comunidad. Cuando corresponda, se aplicarán los criterios de información y revisión indicados en la sección de moderación.",
      "La baja de la cuenta no extingue obligaciones legítimamente pendientes ni impide conservar información cuando exista una obligación legal o una necesidad legítima admitida por la normativa aplicable."
    ]
  },
  {
    title: "15. Propiedad intelectual y contenido aportado",
    paragraphs: [
      "Los derechos sobre las fotografías, textos y demás contenido publicado pertenecen a sus respectivos titulares o a quienes legítimamente los hayan autorizado.",
      "Al publicar contenido, el usuario autoriza a Circula a alojarlo, reproducirlo técnicamente, adaptarlo al formato necesario y mostrarlo dentro de la Plataforma con la finalidad de prestar el servicio, mantener las publicaciones y facilitar su visualización.",
      "Esta autorización se limita a los usos necesarios para operar y promover las funcionalidades de Circula y no implica la transferencia de la titularidad del contenido al Titular.",
      "El usuario declara que tiene derecho a publicar el contenido y se compromete a no infringir derechos de terceros. Si considera que un contenido vulnera sus derechos, podrá comunicarlo al canal de contacto habilitado, aportando información suficiente para identificar la publicación y explicar el reclamo."
    ]
  },
  {
    title: "16. Datos personales y servicios de terceros",
    paragraphs: [
      "Circula trata información necesaria para gestionar cuentas, publicaciones, mensajería, funcionalidades Premium y seguridad de la Plataforma.",
      "Según las funcionalidades utilizadas, esta información puede incluir nombre, correo electrónico, fotografía de perfil, información de publicaciones, mensajes privados, datos técnicos y registros de autenticación, información recibida a través de Google o Facebook, identificadores de transacciones de pago y datos necesarios para las notificaciones.",
      "La Plataforma utiliza servicios de terceros, entre ellos Firebase, Cloudinary y Mercado Pago, para funciones de autenticación, almacenamiento o gestión de imágenes, pagos y servicios relacionados.",
      "Cada proveedor puede tratar datos conforme a sus propias condiciones y políticas de privacidad.",
      "La información detallada sobre finalidades, categorías de datos, destinatarios, conservación, medidas de seguridad y ejercicio de derechos deberá desarrollarse en una Política de Privacidad independiente, accesible antes o al momento de la recopilación de datos.",
      "El tratamiento deberá ajustarse a la Ley 25.326 de Protección de los Datos Personales y a las demás normas aplicables. Los usuarios podrán ejercer los derechos de acceso, rectificación, actualización y supresión en los términos legalmente previstos."
    ]
  },
  {
    title: "17. Disponibilidad y cambios técnicos",
    paragraphs: [
      "Circula se ofrece según las funcionalidades disponibles en cada momento. El Titular procurará mantener el servicio operativo, pero no garantiza disponibilidad ininterrumpida, ausencia absoluta de errores ni compatibilidad con todos los dispositivos o sistemas.",
      "Podrán producirse interrupciones por mantenimiento, fallos técnicos, servicios de terceros, incidentes de seguridad o circunstancias ajenas al control razonable del Titular.",
      "El Titular podrá modificar, actualizar, suspender o retirar funcionalidades por motivos operativos, técnicos, legales o de seguridad, respetando los derechos aplicables y las condiciones de las suscripciones vigentes."
    ]
  },
  {
    title: "18. Alcance de la responsabilidad",
    paragraphs: [
      "Circula facilita el contacto entre usuarios, pero no certifica la identidad de las partes, la titularidad o autenticidad de los productos, su estado, su valor, su legalidad ni la ejecución del canje.",
      "Cada usuario es responsable de sus publicaciones, comunicaciones, declaraciones y acuerdos con otros usuarios.",
      "En la medida permitida por la legislación aplicable, el Titular no garantiza el resultado de las negociaciones privadas ni la conducta de terceros. Sin embargo, ninguna disposición de estos términos excluye o limita responsabilidades que legalmente no puedan excluirse, ni los derechos que correspondan por incumplimientos propios del servicio.",
      "Los usuarios deberán comunicar incidentes relevantes por los canales de contacto habilitados. El Titular podrá colaborar con las autoridades competentes cuando exista una obligación legal o un requerimiento válido."
    ]
  },
  {
    title: "19. Enlaces y servicios externos",
    paragraphs: [
      "La Plataforma puede utilizar o enlazar servicios externos, incluidos proveedores de autenticación, almacenamiento, mensajería o pago.",
      "Circula no controla necesariamente las políticas, disponibilidad o decisiones de esos proveedores. El uso de tales servicios puede quedar sujeto a sus propios términos y condiciones.",
      "Esta disposición no libera al Titular de las obligaciones que le correspondan por la selección, integración o utilización de esos servicios conforme a la legislación aplicable."
    ]
  },
  {
    title: "20. Legislación aplicable y resolución de controversias",
    paragraphs: [
      "Estos términos se interpretarán de acuerdo con las leyes de la República Argentina, sin perjuicio de las normas imperativas que resulten aplicables.",
      "Las controversias se someterán a las autoridades administrativas o judiciales competentes conforme a la legislación vigente. Nada en esta sección pretende imponer al consumidor una renuncia a sus derechos ni alterar las reglas obligatorias de competencia judicial."
    ]
  },
  {
    title: "21. Contacto",
    paragraphs: [
      "Para consultas, solicitudes relacionadas con la cuenta, reportes de publicaciones o cuestiones vinculadas con estos términos, el usuario podrá utilizar el canal oficial que el Titular habilite."
    ],
    notice: "Datos del titular y contacto oficial: pendientes de completar antes de la publicación definitiva."
  }
];

function Section({ section, index }) {
  return (
    <section className={styles.section} id={`seccion-${index + 1}`}>
      <h2>{section.title}</h2>
      {section.intro && <p>{section.intro}</p>}
      {section.paragraphs?.map((paragraph, i) => (
        <p key={`p-${i}`}>{paragraph}</p>
      ))}
      {section.bullets && (
        <ul>
          {section.bullets.map(([label, text], i) => (
            <li key={`li-${i}`}>
              {label && <strong>{label}</strong>}
              {text}
            </li>
          ))}
        </ul>
      )}
      {section.paragraphs2?.map((paragraph, i) => (
        <p key={`p2-${i}`}>{paragraph}</p>
      ))}
      {section.notice && <p className={styles.notice}>{section.notice}</p>}
    </section>
  );
}

export default function TermsAndConditions() {
  return (
    <main className={styles.page}>
      <article className={styles.document}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>CIRCULA · DOCUMENTACIÓN LEGAL</p>
          <h1>Términos y Condiciones de Uso</h1>
          <p className={styles.subtitle}>
            Reglas de acceso y utilización de la plataforma Circula.
          </p>
          <p className={styles.version}>Versión preliminar · 17 de octubre de 2026</p>
        </header>

        <aside className={styles.disclaimer} role="note">
          <strong>Documento preliminar</strong>
          <p>
            Este texto es una versión de trabajo basada en las funcionalidades
            actualmente informadas. Antes de publicarlo como documento definitivo,
            deben completarse los datos del titular y revisarse los puntos pendientes
            con asesoramiento jurídico argentino.
          </p>
        </aside>

        <nav className={styles.contents} aria-label="Índice de los términos y condiciones">
          <h2>Contenido</h2>
          <ol>
            {sections.map((section, index) => (
              <li key={section.title}>
                <a href={`#seccion-${index + 1}`}>
                  {section.title.replace(/^\d+\.\s*/, "")}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.body}>
          {sections.map((section, index) => (
            <Section key={section.title} section={section} index={index} />
          ))}
        </div>

        <footer className={styles.footer}>
          <p>
            Circula · Términos y Condiciones · Versión preliminar del 17/10/2026
          </p>
        </footer>
      </article>
    </main>
  );
}
