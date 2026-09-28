import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import style from "./PaymentSuccess.module.css";

const MAX_ATTEMPTS = 8;
const RETRY_INTERVAL = 2000;

const PaymentSuccess = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  const checkPremium = useCallback(async () => {
    try {
      const response = await api.get("/users/me");

      if (response?.data?.plan === "premium") {
        setStatus("premium");
        return true;
      }

      return false;
    } catch (error) {
      console.error(
        "Error al verificar el plan Premium:",
        error
      );

      setStatus("error");
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timeoutId;

    const verifyPayment = async (currentAttempt = 0) => {
      if (cancelled) return;

      setAttempt(currentAttempt);

      const isPremium = await checkPremium();

      if (cancelled) return;

      if (isPremium) {
        return;
      }

      if (currentAttempt >= MAX_ATTEMPTS - 1) {
        setStatus("pending");
        return;
      }

      setStatus("loading");

      timeoutId = window.setTimeout(() => {
        verifyPayment(currentAttempt + 1);
      }, RETRY_INTERVAL);
    };

    verifyPayment();

    return () => {
      cancelled = true;

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [checkPremium]);

  const handleRetry = async () => {
    setStatus("loading");

    const isPremium = await checkPremium();

    if (!isPremium) {
      setStatus("pending");
    }
  };

  return (
    <main className={style.container}>
      <section className={style.card}>
        {status === "loading" && (
          <>
            <div
              className={style.icon}
              aria-hidden="true"
            >
              🔄
            </div>

            <h1 className={style.title}>
              Confirmando tu pago...
            </h1>

            <p className={style.text}>
              Estamos verificando la activación de tu
              plan Premium.
            </p>

            <div
              className={style.loader}
              role="status"
              aria-label="Verificando pago"
            >
              <span />
              <span />
              <span />
            </div>

            <p className={style.progress}>
              Verificación {Math.min(attempt + 1, MAX_ATTEMPTS)}{" "}
              de {MAX_ATTEMPTS}
            </p>
          </>
        )}

        {status === "pending" && (
          <>
            <div
              className={style.icon}
              aria-hidden="true"
            >
              ⏳
            </div>

            <h1 className={style.title}>
              Pago aprobado
            </h1>

            <p className={style.text}>
              El pago fue recibido, pero Premium todavía
              no aparece activado en tu cuenta.
            </p>

            <div className={style.notice}>
              Esto puede ocurrir mientras el servidor
              termina de procesar la confirmación del pago.
            </div>

            <div className={style.actions}>
              <button
                type="button"
                className={style.primaryButton}
                onClick={handleRetry}
              >
                Revisar nuevamente
              </button>

              <button
                type="button"
                className={style.secondaryButton}
                onClick={() => navigate("/")}
              >
                Volver al inicio
              </button>
            </div>
          </>
        )}

        {status === "premium" && (
          <>
            <div
              className={style.icon}
              aria-hidden="true"
            >
              🎉
            </div>

            <h1 className={style.successTitle}>
              ¡Pago aprobado!
            </h1>

            <h2 className={style.subtitle}>
              👑 Ahora sos usuario Premium
            </h2>

            <p className={style.text}>
              Disfrutá de todas las funciones exclusivas
              de Circula.
            </p>

            <hr className={style.separator} />

            <div className={style.benefits}>
              <h3>💎 Beneficios que ya tenés</h3>

              <ul>
                <li>🚀 Publicaciones ilimitadas</li>
                <li>
                  👀 Ver quién quiere canjear contigo
                </li>
                <li>
                  ⭐ Mayor visibilidad de tus artículos
                </li>
                <li>⚡ Prioridad en búsquedas</li>
                <li>🔒 Acceso a funciones exclusivas</li>
              </ul>
            </div>

            <div className={style.actions}>
              <button
                type="button"
                className={style.primaryButton}
                onClick={() => navigate("/perfil")}
              >
                👤 Ir a mi perfil
              </button>

              <button
                type="button"
                className={style.secondaryButton}
                onClick={() => navigate("/")}
              >
                🏠 Volver al inicio
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div
              className={style.icon}
              aria-hidden="true"
            >
              ❌
            </div>

            <h1 className={style.title}>
              No pudimos verificar el pago
            </h1>

            <p className={style.text}>
              Ocurrió un problema al consultar el estado
              actual de tu cuenta.
            </p>

            <div className={style.actions}>
              <button
                type="button"
                className={style.primaryButton}
                onClick={handleRetry}
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
          </>
        )}
      </section>
    </main>
  );
};

export default PaymentSuccess;