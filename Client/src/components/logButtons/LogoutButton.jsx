import { getAuth, signOut } from "firebase/auth";

const LogoutButton = () => {
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token"); // si guardás tu JWT personalizado
      window.location.href = window.location.origin; // redirige al home
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <button onClick={handleLogout}>
      Log Out
    </button>
  );
};

export default LogoutButton;