import { useLocation, useNavigate } from "react-router-dom";
import style from "./PaymentFailure.module.css";

const PaymentFailure = () => {
  const { search } = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(search);

  const paymentId = params.get("payment_id");
  const status = params.get("status");
  const statusDetail = params.get("status_detail");

  return (
    <main className={style.container}>
      <section className={style.card}>
        <div className={style.icon} aria-hidden="true">
          ❌
        </div>

        <h1 className={style.title}>Pago no completado</h1>

        <p className={style.text}>
          El pago no pudo procesarse o fue cancelado.
          Revisá los datos de la operación y, si es necesario,
          intentá nuevamente.
        </p>

        <div className={style.infoBox}>
          <p>
            <strong>Estado:</strong>{" "}
            {status || "Desconocido"}
          </p>

          <p>
            <strong>Detalle:</strong>{" "}
            {statusDetail || "—"}
          </p>

          <p>
            <strong>ID de pago:</strong>{" "}
            {paymentId || "—"}
          </p>
        </div>

        <div className={style.actions}>
          <button
            type="button"
            className={style.primaryButton}
            onClick={() => navigate("/premium")}
          >
            Intentar nuevamente
          </button>

          <button
            type="button"
            className={style.secondaryButton}
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </button>
        </div>

        <p className={style.help}>
          Si el problema persiste, intentá con otro medio
          de pago o contactá soporte.
        </p>
      </section>
    </main>
  );
};

export default PaymentFailure;