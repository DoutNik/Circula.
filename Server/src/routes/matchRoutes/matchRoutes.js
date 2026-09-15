const express = require("express");
const router = express.Router();
const matchController = require("../../controllers/matchControllers");
const authorization = require("../../middleware/authorization");
const isSelfOrAdmin = require("../../middleware/isSelfOrAdmin");
const isAdmin = require("../../middleware/isAdmin");

router.get("/all", authorization, isAdmin, async (req, res) => {
  try {
    const matches = await matchController.findAllMatches();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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
