const express = require("express");
const authorization = require("../../middleware/authorization");
const blocks = require("../../controllers/blocksController");

const router = express.Router();

router.get("/", authorization, async (req, res) => {
  try {
    return res.json(await blocks.listBlocks(req.authUserId));
  } catch (error) {
    return res.status(500).json({ error: "No se pudieron obtener los bloqueos." });
  }
});

router.post("/:userId", authorization, async (req, res) => {
  try {
    const block = await blocks.createBlock(req.authUserId, Number(req.params.userId));
    return res.status(201).json(block);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete("/:userId", authorization, async (req, res) => {
  try {
    await blocks.removeBlock(req.authUserId, Number(req.params.userId));
    return res.status(204).end();
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

module.exports = router;
