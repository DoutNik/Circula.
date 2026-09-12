const express = require("express");
const router = express.Router();
const matchController = require("../../controllers/matchControllers");
const authorization = require("../../middleware/authorization");
const isSelfOrAdmin = require("../../middleware/isSelfOrAdmin");

// Solo el propio usuario (o un admin) puede ver sus matches
router.get(
  "/:userId",
  authorization,
  isSelfOrAdmin("userId"),
  async (req, res) => {
    const { userId } = req.params;
    try {
      const matches = await matchController.findMatches(userId);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
