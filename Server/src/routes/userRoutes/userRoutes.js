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

router.get(
  "/allDisabledUsers",
  authorization,
  isAdmin,
  async (req, res) => {
    try {
      const response = await userController.getAllDisabled();
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },
);

router.get(
  "/allExistingUsers",
  authorization,
  isAdmin,
  async (req, res) => {
    try {
      const response = await userController.getAllExisting();
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },
);

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
  const user = req.body;
  try {
    const response = await userController.socialRegisterOrLogin(user);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get("/userId", authorization, async (req, res) => {
  try {
    const response = await userController.getUserId(req.body.user);
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
router.put(
  "/:id",
  authorization,
  isSelfOrAdmin("id"),
  async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    try {
      const requester = await userController.getUserId(req.body.user);
      await userController.updateUser(id, updatedData, requester);
      return res.status(200).json({ message: "Resource updated successfully" });
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },
);

router.get("/logueado", async (req, res) => {
  const { email } = req.query;
  try {
    const logueado = await userController.userLogueado({ email });
    return res.status(200).json(logueado);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

// Solo el dueño de la cuenta (o un admin) puede borrarla
router.delete(
  "/:id",
  authorization,
  isSelfOrAdmin("id"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const response = await userController.deleteUser(id);
      return res.status(200).json({ message: "User successfully deleted" });
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },
);

router.post("/forgot-password", authLimiter, async (req, res) => {
  const { email } = req.body;
  try {
    const result = await userController.forgotPassword(email);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.post("/reset-password/:id", authLimiter, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  try {
    const result = await userController.resetPassword(id, password);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Solo administradores pueden restaurar cuentas deshabilitadas
router.put(
  "/restoreUser/:id",
  authorization,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const restoredUser = await userController.restoreUser(id);
      return res.status(200).json({ restoredUser });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
);

module.exports = router;
