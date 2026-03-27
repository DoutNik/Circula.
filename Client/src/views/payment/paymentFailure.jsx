import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentFailure() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  const paymentId = params.get("payment_id");
  const status = params.get("status");
  const statusDetail = params.get("status_detail");

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>❌</div>

        <h1 style={styles.title}>Pago no completado</h1>

        <p style={styles.text}>
          Tu pago no pudo procesarse o fue cancelado.
          No se realizó ningún cargo.
        </p>

        <div style={styles.infoBox}>
          <p><strong>Estado:</strong> {status || "Desconocido"}</p>
          <p><strong>Detalle:</strong> {statusDetail || "—"}</p>
          <p><strong>ID de pago:</strong> {paymentId || "—"}</p>
        </div>

        <div style={styles.actions}>
          <button
            style={styles.primaryButton}
            onClick={() => navigate("/premium")}
          >
            Intentar nuevamente
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </button>
        </div>

        <p style={styles.help}>
          Si el problema persiste, intenta con otro medio de pago
          o contacta soporte.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f7fa",
    padding: 20,
  },
  card: {
    background: "#fff",
    padding: 40,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    maxWidth: 480,
    width: "100%",
    textAlign: "center",
  },
  icon: {
    fontSize: 64,
    marginBottom: 10,
  },
  title: {
    marginBottom: 10,
  },
  text: {
    color: "#555",
    marginBottom: 20,
  },
  infoBox: {
    background: "#f1f3f5",
    padding: 16,
    borderRadius: 10,
    textAlign: "left",
    marginBottom: 24,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  primaryButton: {
    padding: "12px 16px",
    borderRadius: 8,
    border: "none",
    background: "#ff4d4f",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  },
  help: {
    marginTop: 20,
    fontSize: 14,
    color: "#888",
  },
};