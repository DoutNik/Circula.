function createEmailVerification({ auth }) {
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
      throw Object.assign(new Error("Confirmá tu correo antes de ingresar. Ingresá el código que te enviamos o pedí uno nuevo."), { code: "EMAIL_NOT_VERIFIED", status: 403 });
    }
  }
  async function markVerified(user) {
    const record = await identity(user);
    await auth.updateUser(record.uid, { emailVerified: true });
  }
  return { requireVerified, markVerified };
}
module.exports = { createEmailVerification };
