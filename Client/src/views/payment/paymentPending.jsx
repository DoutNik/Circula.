import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentPending() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  const paymentId = params.get("payment_id");
  const status = params.get("status");

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>⏳</div>

        <h1 style={styles.title}>Pago pendiente</h1>

        <p style={styles.text}>
          Tu pago está en proceso de confirmación.
          Esto puede demorar algunos minutos o hasta 48 horas,
          dependiendo del medio de pago.
        </p>

        <div style={styles.infoBox}>
          <p><strong>Estado:</strong> {status || "Pendiente"}</p>
          <p><strong>ID de pago:</strong> {paymentId || "—"}</p>
        </div>

        <div style={styles.notice}>
          💡 Te avisaremos cuando el pago sea acreditado.
          Puedes cerrar esta página sin problemas.
        </div>

        <div style={styles.actions}>
          <button
            style={styles.primaryButton}
            onClick={() => navigate("/")}
          >
            Ir al inicio
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/premium")}
          >
            Ver estado del plan
          </button>
        </div>

        <p style={styles.help}>
          Si pagaste en efectivo, revisa tu comprobante
          y completa el pago antes de la fecha de vencimiento.
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
    marginBottom: 20,
  },
  notice: {
    background: "#fff7e6",
    padding: 14,
    borderRadius: 10,
    marginBottom: 24,
    fontSize: 14,
    color: "#8a6d3b",
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
    background: "#faad14",
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