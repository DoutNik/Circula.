const express = require("express");
const router = express.Router();
const userController = require("../../controllers/usersControllers");
const validInfo = require("../../middleware/validInfo");
const authorization = require("../../middleware/authorization");
const isAdmin = require("../../middleware/isAdmin");
const isSelfOrAdmin = require("../../middleware/isSelfOrAdmin");
const { authLimiter } = require("../../middleware/rateLimiters");

// Solo administradores pueden listar todos los usuarios
router.get("/allUsers", authorization, isAdmin, async (req, res) => {
  try {
    const response = await userController.getAllUser();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get("/allDisabledUsers", authorization, isAdmin, async (req, res) => {
  try {
    const response = await userController.getAllDisabled();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get("/allExistingUsers", authorization, isAdmin, async (req, res) => {
  try {
    const response = await userController.getAllExisting();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.post("/register", authLimiter, validInfo, async (req, res) => {
  const user = req.body;
  try {
    const response = await userController.createUser(user);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.post("/login", authLimiter, validInfo, async (req, res) => {
  const user = req.body;
  try {
    const response = await userController.loginUser(user);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get("/verify", authorization, async (req, res) => {
  try {
    return res.status(200).json(true);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

router.post("/social-login", authLimiter, async (req, res) => {
  try {
    const response = await userController.socialRegisterOrLogin(req.body.idToken);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

router.get("/userId", authorization, async (req, res) => {
  try {
    const response = await userController.getUserId(req.authUserId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

// Requiere login: ver el perfil público de otro usuario
router.get("/anotherUserId", authorization, async (req, res) => {
  const { id } = req.query;
  try {
    const response = await userController.getAnotherUser(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get("/userById/:id", authorization, async (req, res) => {
  const { id } = req.params;
  try {
    const response = await userController.getUserById(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

// Solo el dueño del perfil (o un admin) puede editarlo
router.put("/:id", authorization, isSelfOrAdmin("id"), async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  try {
    // El solicitante sale del JWT verificado, no del body controlado por el
    // navegador. Solo un admin autenticado puede modificar el plan.
    const requester = await userController.getUserId(req.authUserId);
    await userController.updateUser(id, updatedData, requester);
    return res.status(200).json({ message: "Resource updated successfully" });
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

// El usuario autenticado puede borrar definitivamente su propia cuenta y sus
// datos asociados. Esta ruta no depende de un id que llegue desde el cliente.
router.delete("/me", authorization, async (req, res) => {
  try {
    await userController.deleteUser(req.authUserId);
    return res.status(200).json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// El token FCM pertenece a la sesión autenticada, no a un id enviado por el
// navegador. El valor se trata como secreto y no se devuelve en ningún perfil.
router.put("/me/push-token", authorization, async (req, res) => {
  try {
    await userController.savePushToken(req.authUserId, req.body?.token);
    return res.status(204).end();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Solo un administrador puede deshabilitar una cuenta de forma reversible.
// No se borran datos en este flujo porque la restauración debe conservarlos.
router.put("/disable/:id", authorization, isAdmin, async (req, res) => {
  try {
    await userController.disableUser(req.params.id);
    return res.status(200).json({ message: "Usuario deshabilitado" });
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.post("/forgot-password", authLimiter, async (req, res) => {
  const { email } = req.body;

  try {
    const result = await userController.forgotPassword(email);

    return res.status(200).json({
      message: result,
    });
  } catch (error) {
    console.error("ERROR forgot-password:", error);

    return res.status(400).json({
      error: error.message,
    });
  }
});

// Página pública exigida por las tiendas: solicita un enlace de confirmación
// sin revelar si el correo posee una cuenta.
router.post("/request-account-deletion", authLimiter, async (req, res) => {
  const message = await userController.requestAccountDeletion(req.body?.email);
  return res.status(200).json({ message });
});

router.delete("/delete-by-token", authLimiter, async (req, res) => {
  try {
    await userController.deleteUserByToken(req.body?.token);
    return res.status(200).json({ message: "Cuenta eliminada correctamente." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Un borrado por id es definitivo; solo lo permite al propio usuario o a un
// administrador para conservar la compatibilidad de API existente. Debe ir
// después de las rutas literales, para que no capture "delete-by-token".
router.delete("/:id", authorization, isSelfOrAdmin("id"), async (req, res) => {
  const { id } = req.params;
  try {
    await userController.deleteUser(id);
    return res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.post("/reset-password", authLimiter, async (req, res) => {
  const { password, token } = req.body;
  try {
    const result = await userController.resetPassword(token, password);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Solo administradores pueden restaurar cuentas deshabilitadas
router.put("/restoreUser/:id", authorization, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const restoredUser = await userController.restoreUser(id);
    return res.status(200).json({ restoredUser });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
