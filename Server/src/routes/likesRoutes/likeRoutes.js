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

    const requesterId = String(req.body.user);

    if (
      requesterId === String(like.anotherUserId) ||
      requesterId === String(like.myUserId)
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

router.post("/", authorization, async (req, res) => {
  try {
    const { likedPostId, myPostId, anotherUserId } = req.body;
    // myUserId siempre sale del token, nunca del body
    const myUserId = req.body.user;
    const result = await likeController.createLike(
      myUserId,
      likedPostId,
      myPostId,
      anotherUserId,
    );

    if (result) {
      return res
        .status(201)
        .json({ message: "Like registrado con éxito", like: result });
    } else {
      return res.status(400).json({ error: "Error al registrar el like" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/allLikes", authorization, isAdmin, async (req, res) => {
  try {
    const likes = await likeController.getAllLikes();
    return res.status(200).json(likes);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

// Solo se pueden ver los likes recibidos propios
router.get(
  "/getLikesRecibidos/:myUserId",
  authorization,
  async (req, res) => {
    const { myUserId } = req.params;

    if (String(myUserId) !== String(req.body.user)) {
      return res.status(403).json("Not Authorize");
    }

    try {
      const likes = await likeController.getLikesRecibidos(myUserId);
      return res.status(200).json(likes);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },
);

router.put("/respond/:id", authorization, isLikePartyOrAdmin, async (req, res) => {
  const { action } = req.body;

  try {
    let result;

    if (action === "accepted") {
      result = await likeController.acceptLike(req.params.id);
    } else {
      result = await likeController.rejectLike(req.params.id);
    }

    res.json(result);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.delete("/:likeId", authorization, isLikePartyOrAdmin, async (req, res) => {
  try {
    const { likeId } = req.params;

    const deletedLike = await likeController.removeLike(likeId);

    if (deletedLike) {
      return res.status(200).json(deletedLike);
    } else {
      return res.status(404).json("Like not found");
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "There was an error deleting the Like" });
  }
});

module.exports = router;
