import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebase.js";
import api from "./api.js";
import { retryLogin } from "./retryLogin.js";

// Both entry points establish the same Firebase and API session. Never keep
// an API token if Firebase sign-in has not completed successfully.
export async function loginWithEmail(credentials, options) {
  const { data } = await retryLogin(
    () => api.post("/users/login", {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
    options,
  );
  const { token, firebaseToken, usuario } = data;
  if (!token || !firebaseToken || !usuario?.id) {
    throw new Error("No pudimos completar el acceso. Intentá nuevamente.");
  }
  await signInWithCustomToken(auth, firebaseToken);
  localStorage.setItem("token", token);
  return usuario;
}
