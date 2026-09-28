const express = require("express");
const router = express.Router();

const likeController = require("../../controllers/likeControllers");
const authorization = require("../../middleware/authorization");
const isAdmin = require("../../middleware/isAdmin");
const { Like, User } = require("../../DB_config");

// Solo quien recibió el like (o un admin) puede aceptarlo/rechazarlo/borrarlo
const isLikePartyOrAdmin = async (req, res, next) => {
  try {
    const idParam = req.params.id || req.params.likeId;

    const like = await Like.findByPk(idParam);

    if (!like) {
      return res.status(404).json("Like not found");
    }

    const requesterId = req.authUserId;

    if (
      requesterId === Number(like.anotherUserId) ||
      requesterId === Number(like.myUserId)
    ) {
      return next();
    }

    const user = await User.findByPk(requesterId);

    if (user && user.rol === "admin") {
      return next();
    }

    return res.status(403).json("Not Authorize");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// Crear like
router.post("/", authorization, async (req, res) => {
  try {
    const {
      likedPostId,
      myPostId,
      anotherUserId,
    } = req.body;

    // El usuario sale SIEMPRE del token
    const myUserId = req.authUserId;

    const result = await likeController.createLike(
      myUserId,
      likedPostId,
      myPostId,
      anotherUserId,
    );

    if (result) {
      return res.status(201).json({
        message: "Like registrado con éxito",
        like: result,
      });
    }

    return res.status(400).json({
      error: "Error al registrar el like",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// Solo admin
router.get(
  "/allLikes",
  authorization,
  isAdmin,
  async (req, res) => {
    try {
      const likes = await likeController.getAllLikes();

      return res.status(200).json(likes);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },
);

// Likes recibidos por el usuario autenticado
router.get(
  "/getLikesRecibidos",
  authorization,
  async (req, res) => {
    try {
      const myUserId = req.authUserId;

      const likes =
        await likeController.getLikesRecibidos(
          myUserId,
        );

      return res.status(200).json(likes);
    } catch (error) {
      console.error(
        "Error al obtener los likes recibidos:",
        error,
      );

      return res.status(400).json({
        error: error.message,
      });
    }
  },
);

// Likes enviados por el usuario autenticado
router.get(
  "/getLikesEnviados",
  authorization,
  async (req, res) => {
    try {
      const myUserId = req.authUserId;

      const likes =
        await likeController.getLikesEnviados(
          myUserId,
        );

      return res.status(200).json(likes);
    } catch (error) {
      console.error(
        "Error al obtener los likes enviados:",
        error,
      );

      return res.status(400).json({
        error: error.message,
      });
    }
  },
);

router.put(
  "/respond/:id",
  authorization,
  isLikePartyOrAdmin,
  async (req, res) => {
    const { action } = req.body;

    try {
      let result;

      if (action === "accepted") {
        result = await likeController.acceptLike(
          req.params.id,
        );
      } else {
        result = await likeController.rejectLike(
          req.params.id,
        );
      }

      return res.json(result);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },
);

router.delete(
  "/:likeId",
  authorization,
  isLikePartyOrAdmin,
  async (req, res) => {
    try {
      const { likeId } = req.params;

      const deletedLike =
        await likeController.removeLike(likeId);

      if (deletedLike) {
        return res.status(200).json(deletedLike);
      }

      return res.status(404).json("Like not found");
    } catch (error) {
      return res.status(500).json({
        error: "There was an error deleting the Like",
      });
    }
  },
);

module.exports = router;