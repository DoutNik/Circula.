import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../../firebase";

export const logoutUser = async (clerkSignOut) => {
  try {
    await clerkSignOut?.();
    await firebaseSignOut(auth);

    localStorage.removeItem("token");

    // Tu app usa HashRouter.
    window.location.hash = "#/login";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};