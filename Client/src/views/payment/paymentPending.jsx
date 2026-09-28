import { useLocation, useNavigate } from "react-router-dom";
import style from "./PaymentPending.module.css";

const PaymentPending = () => {
  const { search } = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(search);

  const paymentId = params.get("payment_id");
  const status = params.get("status");

  return (
    <main className={style.container}>
      <section className={style.card}>
        <div className={style.icon} aria-hidden="true">
          ⏳
        </div>

        <h1 className={style.title}>Pago pendiente</h1>

        <p className={style.text}>
          Tu pago está en proceso de confirmación.
          El tiempo de acreditación puede variar según
          el medio de pago utilizado.
        </p>

        <div className={style.infoBox}>
          <p>
            <strong>Estado:</strong>{" "}
            {status || "Pendiente"}
          </p>

          <p>
            <strong>ID de pago:</strong>{" "}
            {paymentId || "—"}
          </p>
        </div>

        <div className={style.notice}>
          <span aria-hidden="true">💡</span>
          <span>
            Te avisaremos cuando el pago sea acreditado.
            Podés cerrar esta página sin problemas.
          </span>
        </div>

        <div className={style.actions}>
          <button
            type="button"
            className={style.primaryButton}
            onClick={() => navigate("/")}
          >
            Ir al inicio
          </button>

          <button
            type="button"
            className={style.secondaryButton}
            onClick={() => navigate("/premium")}
          >
            Ver estado del plan
          </button>
        </div>

        <p className={style.help}>
          Conservá el comprobante de pago hasta que
          la operación quede confirmada.
        </p>
      </section>
    </main>
  );
};

export default PaymentPending;