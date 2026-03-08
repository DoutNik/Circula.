import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("token");
    window.location.href = "/login";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};