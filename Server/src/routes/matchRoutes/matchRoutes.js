const express = require("express");

const router = express.Router();

const matchController = require("../../controllers/matchControllers");

const authorization = require("../../middleware/authorization");
const isSelfOrAdmin = require("../../middleware/isSelfOrAdmin");
const isAdmin = require("../../middleware/isAdmin");

// Obtener todos los matches.
// Solo administradores.
router.get("/all", authorization, isAdmin, async (req, res) => {
  try {
    const matches = await matchController.findAllMatches();

    return res.status(200).json(matches);
  } catch (error) {
    console.error("Error al obtener todos los matches:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

// Obtener los matches de un usuario.
// Un usuario puede consultar los propios.
// Un admin puede consultar los de cualquier usuario.
router.get(
  "/:userId",
  authorization,
  isSelfOrAdmin("userId"),
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: "userId inválido",
        });
      }

      const matches = await matchController.findMatches(userId);

      return res.status(200).json(matches);
    } catch (error) {
      console.error("Error al obtener los matches:", error);

      return res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  },
);

module.exports = router;
