// Firebase sends and validates the expiring, single-use verification link.
// This is the public Web API key already used by Client/src/firebase.js.
const DEFAULT_WEB_API_KEY = "AIzaSyDD3yJAsH0CJEeKXYGTExS5zXyucEGv27o";
function createEmailVerification({ auth, apiKey = process.env.FIREBASE_WEB_API_KEY || DEFAULT_WEB_API_KEY, fetchImpl = fetch }) {
  async function identity(user) {
    const uid = user.firebaseUid || String(user.id);
    let record;
    try { record = await auth.getUser(uid); }
    catch (error) {
      if (error.code !== "auth/user-not-found") throw error;
      record = await auth.createUser({ uid, email: user.email, emailVerified: false });
    }
    if (record.disabled || record.email?.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error("No se pudo validar la identidad de esta cuenta.");
    }
    return record;
  }
  async function requireVerified(user) {
    if ((await identity(user)).emailVerified !== true) {
      throw Object.assign(new Error("Confirmá tu correo antes de ingresar. Revisá tu bandeja de entrada y spam, o pedí un nuevo enlace."), { code: "EMAIL_NOT_VERIFIED", status: 403 });
    }
  }
  async function post(action, body) {
    const response = await fetchImpl(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${apiKey}`, {
      method: "POST", headers: { "Content-Type": "application/json", "X-Firebase-Locale": "es" },
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("No pudimos enviar el correo de verificación. Intentá nuevamente más tarde.");
    return response.json();
  }
  async function send(user) {
    const record = await identity(user);
    if (record.emailVerified) return { verified: true };
    // Never return these credentials to an unverified browser session.
    const token = await auth.createCustomToken(record.uid);
    const session = await post("signInWithCustomToken", { token, returnSecureToken: true });
    if (!session.idToken) throw new Error("No pudimos preparar el correo de verificación.");
    await post("sendOobCode", { requestType: "VERIFY_EMAIL", idToken: session.idToken });
    return { verified: false };
  }
  return { send, requireVerified };
}
module.exports = { createEmailVerification };
