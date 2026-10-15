
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../../firebase";

export const logoutUser = async () => {
  // Eliminar primero la sesión del backend.
  localStorage.removeItem("token");

  try {
    // Cerrar la sesión de Firebase.
    if (auth.currentUser) {
      await firebaseSignOut(auth);
    }
  } catch (error) {
    console.error("Error al cerrar sesión de Firebase:", error);
  }
};
