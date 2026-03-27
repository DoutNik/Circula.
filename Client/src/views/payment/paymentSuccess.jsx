import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const checkPremium = async () => {
      try {
        const res = await api.get("/users/me");

        if (res.data.plan === "premium") {
          setStatus("premium");
        } else {
          setStatus("pending");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    checkPremium();
  }, []);

  const container = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f8ef, #ffffff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, sans-serif",
    padding: "20px"
  };

  const card = {
    background: "white",
    borderRadius: "18px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
    padding: "40px",
    maxWidth: "520px",
    width: "100%",
    textAlign: "center"
  };

  const button = {
    marginTop: "20px",
    padding: "14px 22px",
    borderRadius: "10px",
    border: "none",
    background: "#1db954",
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer"
  };

  const secondaryButton = {
    ...button,
    background: "#e9ecef",
    color: "#333"
  };

  return (
    <div style={container}>
      <div style={card}>
        {status === "loading" && (
          <>
            <h2>🔄 Confirmando tu pago...</h2>
            <p>Estamos activando tu plan Premium 💛</p>
          </>
        )}

        {status === "pending" && (
          <>
            <h2>⏳ Pago aprobado — activando Premium...</h2>
            <p>Esto puede tardar unos segundos.</p>
          </>
        )}

        {status === "premium" && (
          <>
            <h1 style={{ color: "#1db954" }}>🎉 ¡Pago aprobado!</h1>

            <h2>👑 Ahora eres usuario Premium</h2>

            <p style={{ marginTop: "10px" }}>
              Disfruta de todas las funciones exclusivas de Circula
            </p>

            <hr style={{ margin: "25px 0" }} />

            <div style={{ textAlign: "left" }}>
              <h3>💎 Beneficios que ya tienes:</h3>

              <ul style={{ lineHeight: "1.8", paddingLeft: "18px" }}>
                <li>🚀 Publicaciones ilimitadas</li>
                <li>👀 Ver quién quiere canjear contigo</li>
                <li>⭐ Mayor visibilidad de tus artículos</li>
                <li>⚡ Prioridad en búsquedas</li>
                <li>🔒 Acceso a funciones exclusivas</li>
              </ul>
            </div>

            <button
              style={button}
              onClick={() => navigate("/perfil")}
            >
              👤 Ir a mi perfil
            </button>

            <button
              style={secondaryButton}
              onClick={() => navigate("/")}
            >
              🏠 Volver al inicio
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h2>❌ No pudimos verificar el pago</h2>
            <p>Si el problema persiste, contacta soporte.</p>

            <button
              style={secondaryButton}
              onClick={() => navigate("/")}
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
}