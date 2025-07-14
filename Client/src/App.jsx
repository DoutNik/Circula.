/* eslint-disable no-unused-vars */
import axios from "axios";

import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { messaging, getToken, onMessage } from "./firebase";

import AddProduct from "./views/addProduct/addProduct";
import Chats from "./views/chats/Chats";
import Messages from "./views/Messages/Messages";
import Exchanges from "./views/exchanges/exchanges";
import Home from "./views/home/Home";
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

import "./App.css";
import ReviewForm from "./components/formReview/FormReview";

const App = () => {
  const initialDarkMode = localStorage.getItem("darkMode") === "true";

  const [darkMode, setDarkMode] = useState(initialDarkMode);

  useEffect(() => {
    setDarkModeStyles(darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const setDarkModeStyles = (isDark) => {
    if (isDark) {
      document.body.style.backgroundColor = "rgb(25, 25, 30)";
      document.body.style.color = "grey";
    } else {
      document.body.style.backgroundColor = "whitesmoke";
      document.body.style.color = "grey";
    }
  };

  axios.defaults.baseURL = "http://localhost:3001/";
  //axios.defaults.baseURL = "https://lo-canjeamos-production.up.railway.app/";


  if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado con éxito:', registration);
      })
      .catch(error => {
        console.log('❌ Falló el registro del Service Worker:', error);
      });
  });
}

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  const setAuth = (status, user) => {
    setIsAuthenticated(status);
    setUserData(user);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .get("/users/verify", {
          headers: {
            token: token,
          },
        })
        .then((response) => {
          if (response.data === true) {
            setIsAuthenticated(true);
            axios
              .get("/users/userId", {
                headers: {
                  token: token,
                },
              })
              .then((userDataResponse) => {
                setUserData({
                  email: userDataResponse.data.email,
                  id: userDataResponse.data.id,
                  username: userDataResponse.data.username,
                  image: userDataResponse.data.image,
                  rol: userDataResponse.data.rol,
                  averageRating: userDataResponse.data.averageRating,
                  plan: userDataResponse.data.plan,
                });
              })
              .catch((userDataError) => {
                console.error(
                  "Error al obtener los datos del usuario:",
                  userDataError
                );
              });
          } else {
            setIsAuthenticated(false);
          }
        })
        .catch((error) => {
          console.error("Token no valido o expirado:", error);
          setIsAuthenticated(false);
        });
    } else {
      setIsAuthenticated(false);
    }
  }, [isAuthenticated]);

  //onesignal push notifications
  const [isPremium, setPremium] = useState(false);

  useEffect(() => {
    // Pide permiso
    getToken(messaging, { vapidKey: "BIgcX_H0G3MswOLcfly2-S_b8SY-LI9zu4ihlf5jK2GOgJUhsTMrKZ0nLJUUwwMNqkSQSt76cT_qOpZ9o7QNBzA" })
      .then((currentToken) => {
        if (currentToken) {
          console.log("Token FCM:", currentToken);
          // Podrías enviarlo a tu backend
        } else {
          console.warn("No se recibió token.");
        }
      })
      .catch((err) => {
        console.error("Error al obtener token FCM:", err);
      });

    onMessage(messaging, (payload) => {
      console.log("Mensaje en primer plano: ", payload);
    });
  }, []);

  if (userData && userData) {
    const premium = async () => {
      try {
        const token = localStorage.getItem("token");
        const usuario = await axios.get("/users/userId", {
          headers: {
            token: token,
          },
          params: { id: userData.id },
        });

        if (usuario.data.plan === "premium") {
          setPremium(true);
        }
      } catch (error) {
        console.error("Error al obtener la información del usuario:", error);
      }
    };
    premium();
  }


  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        setAuth={setAuth}
        userData={userData}
      />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              userData ? (
                <MyProfile
                  userData={userData}
                  setAuth={setAuth}
                  toggleDarkMode={toggleDarkMode}
                />
              ) : (
                <div className="spinner">
                  <div className="bounce1"></div>
                  <div className="bounce2"></div>
                  <div className="bounce3"></div>
                </div>
              )
            ) : isAuthenticated ? (
              user ? (
                <MyProfile
                  userData={user.name}
                  setAuth={setAuth}
                  toggleDarkMode={toggleDarkMode}
                />
              ) : (
                <div className="spinner">
                  <div className="bounce1"></div>
                  <div className="bounce2"></div>
                  <div className="bounce3"></div>
                </div>
              )
            ) : (
              <Login setAuth={setAuth} />
            )
          }
        />

        <Route
          path="/addProduct"
          element={
            userData ? (
              <AddProduct userData={userData} />
            ) : (
              <Loading />
            )
          }
        />

        <Route
          path="/detail/:id"
          element={
            userData ? (
              <Detail userData={userData} />
            ) :  (
              <Loading />
            )
          }
        />

        <Route
          path="/exchanges"
          element={
            userData ? (
              <Exchanges userData={userData} />
            ) :  (
              <Loading />
            )
          }
        />

        <Route
          path="/chats/:chatId"
          element={userData ? <Chats userData={userData} /> : <Loading />}
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              userData && <MyProfile userData={userData} setAuth={setAuth} />
            ) : (
              <Register setAuth={setAuth} />
            )
          }
        />

        <Route
          path="/review"
          element={
            userData ? (
              <ReviewForm userData={userData} />
            ) : (
              <Loading />
            )
          }
        />

        <Route path="/forgotpassword" element={<ForgotPassword />} />

        <Route path="/resetpassword/:id" element={<ResetPassword />} />

        <Route
          path="/messages"
          element={
            userData ? (
              <Messages userData={userData} />
            ) :  (
              <Loading />
            )
          }
        />

        <Route path="/admin" element={<AdminDash></AdminDash>} />
        <Route
          path="/UserProfile/:userId"
          element={<UserProfile id={userData}></UserProfile>}
        />
      </Routes>
    </>
  );
};

export default App;

//
