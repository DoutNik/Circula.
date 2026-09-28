import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getToken, onMessage, messaging } from "./firebase";

import api from "./api/api";

import AddProduct from "./views/addProduct/addProduct";
import Chats from "./views/chats/chats";
import Messages from "./views/Messages/Messages";
import Exchanges from "./views/exchanges/exchanges";
import Home from "./views/home/home";
import Detail from "./views/detail/Detail";
import Navbar from "./components/navbar/Nabvar";
import MyProfile from "./views/myProfile/myProfile";
import AdminDash from "./views/adminDash/AdminDash";
import Login from "./views/login/Login";
import Register from "./components/register/Register";
import Loading from "./views/loading/Loading";
import ForgotPassword from "./components/forgotPassword/ForgotPassword";
import ResetPassword from "./components/resetPassword/ResetPassword";
import UserProfile from "./views/userProfile/userProfile";
import useAutoLogout from "./hooks/useAutoLogout";
import PaymentSuccess from "./views/payment/paymentSuccess";
import PaymentFailure from "./views/payment/paymentFailure";
import PaymentPending from "./views/payment/paymentPending";
import FormReview from "./components/formReview/FormReview";

import "./App.css";

api.defaults.baseURL = import.meta.env.VITE_API_URL;

const ProtectedRoute = ({ userData, children }) => {
  return userData ? children : <Loading />;
};

const App = () => {
  useAutoLogout();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

useEffect(() => {
  const root = document.documentElement;

  if (darkMode) {
    root.style.setProperty(
      "--page-background",
      "#19191e"
    );

    root.style.setProperty(
      "--surface",
      "#24242b"
    );

    root.style.setProperty(
      "--surface-secondary",
      "#2d2d35"
    );

    root.style.setProperty(
      "--surface-hover",
      "#34343d"
    );

    root.style.setProperty(
      "--text-primary",
      "#f1f1f1"
    );

    root.style.setProperty(
      "--text-secondary",
      "#cccccc"
    );

    root.style.setProperty(
      "--text-muted",
      "#a5a5a5"
    );

    root.style.setProperty(
      "--border",
      "#41414a"
    );

    root.style.setProperty(
      "--border-strong",
      "#50505a"
    );

    root.style.setProperty(
      "--shadow",
      "rgba(0, 0, 0, 0.35)"
    );

    root.style.setProperty(
      "color-scheme",
      "dark"
    );
  } else {
    root.style.setProperty(
      "--page-background",
      "whitesmoke"
    );

    root.style.setProperty(
      "--surface",
      "#ffffff"
    );

    root.style.setProperty(
      "--surface-secondary",
      "#f5f5f5"
    );

    root.style.setProperty(
      "--surface-hover",
      "#fafafa"
    );

    root.style.setProperty(
      "--text-primary",
      "#333333"
    );

    root.style.setProperty(
      "--text-secondary",
      "#666666"
    );

    root.style.setProperty(
      "--text-muted",
      "#888888"
    );

    root.style.setProperty(
      "--border",
      "#eeeeee"
    );

    root.style.setProperty(
      "--border-strong",
      "#dddddd"
    );

    root.style.setProperty(
      "--shadow",
      "rgba(128, 128, 128, 0.2)"
    );

    root.style.setProperty(
      "color-scheme",
      "light"
    );
  }

  localStorage.setItem(
    "darkMode",
    String(darkMode)
  );
}, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration =
          await navigator.serviceWorker.register("/sw.js");

        console.log(
          "✅ Service Worker registrado con éxito:",
          registration
        );
      } catch (error) {
        console.error(
          "❌ Falló el registro del Service Worker:",
          error
        );
      }
    };

    registerServiceWorker();
  }, []);

  useEffect(() => {
    let unsubscribeMessage;

    const initializeFirebaseMessaging = async () => {
      try {
        const currentToken = await getToken(messaging, {
          vapidKey:
            "BIgcX_H0G3MswOLcfly2-S_b8SY-LI9zu4ihlf5jK2GOgJUhsTMrKZ0nLJUUwwMNqkSQSt76cT_qOpZ9o7QNBzA",
        });

        if (currentToken) {
          // Enviar el token al backend si corresponde.
        } else {
          console.warn("No se recibió token FCM.");
        }
      } catch (error) {
        console.error(
          "Error al obtener token FCM:",
          error
        );
      }
    };

    initializeFirebaseMessaging();

    unsubscribeMessage = onMessage(
      messaging,
      (payload) => {
        console.log(
          "Mensaje en primer plano:",
          payload
        );
      }
    );

    return () => {
      if (unsubscribeMessage) {
        unsubscribeMessage();
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (
        !token ||
        token === "undefined" ||
        token.trim() === ""
      ) {
        if (mounted) {
          setIsAuthenticated(false);
          setUserData(null);
          setIsCheckingAuth(false);
        }

        localStorage.removeItem("token");
        return;
      }

      try {
        const verifyResponse = await api.get(
          "/users/verify",
          {
            headers: {
              token,
            },
          }
        );

        if (verifyResponse.data !== true) {
          throw new Error("Token no autorizado");
        }

        const userResponse = await api.get(
          "/users/userId",
          {
            headers: {
              token,
            },
          }
        );

        if (!mounted) return;

        setUserData({
          email: userResponse.data.email,
          id: userResponse.data.id,
          username: userResponse.data.username,
          image: userResponse.data.image,
          rol: userResponse.data.rol,
          averageRating: userResponse.data.averageRating,
          plan: userResponse.data.plan,
        });

        setIsAuthenticated(true);
      } catch (error) {
        console.error(
          "⚠️ Token inválido o expirado:",
          error.response?.data || error.message
        );

        if (mounted) {
          setIsAuthenticated(false);
          setUserData(null);
        }

        localStorage.removeItem("token");
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const setAuth = (status, user = null) => {
    setIsAuthenticated(status);
    setUserData(status ? user : null);
  };

  if (isCheckingAuth) {
    return <Loading />;
  }

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        setAuth={setAuth}
        userData={userData}
      />

      <div className="appContent">
        <Routes>
          {/* Público */}
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <MyProfile
                  userData={userData}
                  setAuth={setAuth}
                  toggleDarkMode={toggleDarkMode}
                />
              ) : (
                <Login setAuth={setAuth} />
              )
            }
          />

          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <MyProfile
                  userData={userData}
                  setAuth={setAuth}
                  toggleDarkMode={toggleDarkMode}
                />
              ) : (
                <Register setAuth={setAuth} />
              )
            }
          />

          <Route
            path="/forgotpassword"
            element={<ForgotPassword />}
          />

          <Route
            path="/resetpassword/:id"
            element={<ResetPassword />}
          />

          {/* Protegidas */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute userData={userData}>
                <MyProfile
                  userData={userData}
                  setAuth={setAuth}
                  toggleDarkMode={toggleDarkMode}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/addProduct"
            element={
              <ProtectedRoute userData={userData}>
                <AddProduct userData={userData} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/detail/:id"
            element={
              <ProtectedRoute userData={userData}>
                <Detail userData={userData} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exchanges"
            element={
              <ProtectedRoute userData={userData}>
                <Exchanges userData={userData} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chats/:chatId"
            element={
              <ProtectedRoute userData={userData}>
                <Chats userData={userData} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute userData={userData}>
                <Messages userData={userData} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/review/:reviewedUserId"
            element={
              <ProtectedRoute userData={userData}>
                <FormReview userData={userData} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/UserProfile/:userId"
            element={
              <ProtectedRoute userData={userData}>
                <UserProfile id={userData} />
              </ProtectedRoute>
            }
          />

          {/* Pagos */}
          <Route
            path="/success"
            element={<PaymentSuccess />}
          />

          <Route
            path="/failure"
            element={<PaymentFailure />}
          />

          <Route
            path="/pending"
            element={<PaymentPending />}
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={<AdminDash />}
          />
        </Routes>
      </div>
    </>
  );
};

export default App;