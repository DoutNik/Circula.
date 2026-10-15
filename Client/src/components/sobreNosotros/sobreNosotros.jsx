import styles from "./SobreNosotros.module.css";

const SobreNosotros = () => {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Sobre Nosotros</h1>
        <p className={styles.subtitle}>
          Intercambiar es otra forma de aprovechar lo que tenemos.
        </p>
      </header>

      <section className={styles.section}>
        <h2>¿Qué es Circula?</h2>
        <p>
          Circula es una plataforma creada para conectar personas que
          tienen objetos que ya no necesitan con otras que pueden
          darles una nueva utilidad.
        </p>
        <p>
          Creemos que muchas cosas que dejamos de usar todavía tienen
          valor. Por eso, buscamos fomentar una forma de consumo más
          colaborativa, donde los objetos puedan encontrar nuevos
          dueños sin que necesariamente exista dinero de por medio.
        </p>
      </section>

      <section className={styles.section}>
        <h2>¿Cómo funciona?</h2>
        <p>
          En Circula podés publicar productos, explorar artículos de
          otros usuarios, expresar interés y conectar con personas
          que quieran realizar un intercambio.
        </p>
        <p>
          Mediante las coincidencias y el chat, los usuarios pueden
          conversar, ponerse de acuerdo y coordinar los detalles de
          cada canje.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Nuestros valores</h2>

        <div className={styles.values}>
          <article className={styles.value}>
            <h3>♻️ Reutilización</h3>
            <p>
              Promovemos que los objetos tengan una vida útil más
              larga y puedan ser aprovechados por otras personas.
            </p>
          </article>

          <article className={styles.value}>
            <h3>🤝 Colaboración</h3>
            <p>
              Fomentamos una comunidad basada en el intercambio,
              la cooperación y el beneficio mutuo.
            </p>
          </article>

          <article className={styles.value}>
            <h3>🌎 Consumo responsable</h3>
            <p>
              Creemos que reutilizar lo que ya existe puede ayudar
              a reducir el desperdicio y aprovechar mejor los recursos.
            </p>
          </article>

          <article className={styles.value}>
            <h3>💬 Conexión</h3>
            <p>
              Facilitamos el contacto entre personas con intereses
              compatibles para que puedan encontrar oportunidades
              de intercambio.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Nuestra misión</h2>
        <p>
          Queremos que intercambiar sea una alternativa sencilla,
          accesible y práctica. Nuestro objetivo es construir una
          comunidad en la que aquello que ya no necesitás pueda
          convertirse en algo útil para otra persona.
        </p>
      </section>

      <footer className={styles.footer}>
        <p>
          <strong>
            Circula: lo que ya no necesitás puede ser justo lo que
            alguien está buscando.
          </strong>
        </p>
      </footer>
    </main>
  );
};

export default SobreNosotros;