const express = require("express");
const authorization = require("../../middleware/authorization");
const isAdmin = require("../../middleware/isAdmin");
const reports = require("../../controllers/reportsController");

const router = express.Router();

router.post("/", authorization, async (req, res) => {
  try {
    const report = await reports.createReport({
      reporterUserId: req.authUserId,
      targetUserId: req.body?.targetUserId ? Number(req.body.targetUserId) : null,
      targetPostId: req.body?.targetPostId ? Number(req.body.targetPostId) : null,
      reason: req.body?.reason,
    });
    return res.status(201).json(report);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/", authorization, isAdmin, async (_req, res) => {
  try {
    return res.json(await reports.listReports());
  } catch (error) {
    return res.status(500).json({ error: "No se pudieron obtener las denuncias." });
  }
});

router.put("/:id", authorization, isAdmin, async (req, res) => {
  try {
    return res.json(await reports.updateReport(req.params.id, req.body || {}, req.authUserId));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
