import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import styles from "../../components/termsAndConditions/TermsAndConditions.module.css";

export default function DeleteAccount() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const deletionToken = searchParams.get("token");

  const requestDeletion = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await api.post("/users/request-account-deletion", { email });
      setMessage(response.data.message);
    } catch {
      setError("No se pudo procesar la solicitud. Intentá nuevamente.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDeletion = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await api.delete("/users/delete-by-token", { data: { token: deletionToken } });
      setMessage(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "No se pudo eliminar la cuenta.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={styles.page}>
      <article className={styles.document}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>CIRCULA · CUENTA</p>
          <h1>Eliminar cuenta y datos</h1>
          <p className={styles.subtitle}>Este proceso elimina de forma permanente tu perfil, publicaciones, chats, solicitudes, matches y reseñas.</p>
        </header>
        <section className={styles.section}>
          {deletionToken ? (
            <>
              <h2>Confirmá la eliminación</h2>
              <p>El enlace vence en 30 minutos. Esta acción no se puede deshacer.</p>
              <button type="button" onClick={confirmDeletion} disabled={busy}>
                {busy ? "Eliminando…" : "Eliminar mi cuenta definitivamente"}
              </button>
            </>
          ) : (
            <form onSubmit={requestDeletion}>
              <h2>Solicitar enlace de confirmación</h2>
              <p>Ingresá el correo con el que creaste la cuenta. Por seguridad, mostraremos el mismo mensaje aunque no exista una cuenta asociada.</p>
              <label htmlFor="deletion-email">Correo electrónico</label>
              <input
                id="deletion-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
              <button type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar enlace"}</button>
            </form>
          )}
          {message && <p className={styles.notice}>{message}</p>}
          {error && <p className={styles.notice}>{error}</p>}
        </section>
        <p><Link to="/login">Volver a iniciar sesión</Link></p>
      </article>
    </main>
  );
}
