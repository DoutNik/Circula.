import { useCallback, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import Swal from 'sweetalert2';

const useAutoLogout = (timeout = 60 * 60 * 1000) => { // 60 minutos
  const timer = useRef(null);

  const handleLogout = useCallback(async () => {
     try {
      await Swal.fire({
        icon: "warning",
        title: "Sesión cerrada",
        text: "Tu sesión se cerró automáticamente por inactividad.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3085d6",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      await signOut(auth);
      localStorage.removeItem("token");
      // HashRouter no interpreta /login como ruta de la SPA al recargar.
      window.location.assign("/#/login");
    } catch (error) {
      console.error("Error al cerrar sesión automáticamente:", error);
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      handleLogout();
    }, timeout);
  }, [handleLogout, timeout]);

  useEffect(() => {
    const startTracking = () => {
      resetTimer();
      const events = ["mousemove", "keydown", "click", "scroll"];
      events.forEach((event) => window.addEventListener(event, resetTimer));

      return () => {
        events.forEach((event) => window.removeEventListener(event, resetTimer));
        clearTimeout(timer.current);
      };
    };

    // Observar cambios en el estado de autenticación
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        startTracking();
      } else {
        clearTimeout(timer.current);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timer.current);
    };
  }, [resetTimer]);

  return null;
};

export default useAutoLogout;
