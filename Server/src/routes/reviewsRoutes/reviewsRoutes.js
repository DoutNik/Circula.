const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/reviewsController");
const authorization = require("../../middleware/authorization");

// Crear una reseña requiere login; el autor sale del token, no del body
router.post("/", authorization, async (req, res) => {
  try {
    const userId = req.authUserId;
    const { reviewedUserId, title, description, rating } = req.body;

    const response = await reviewController.createReview({
      userId,
      reviewedUserId,
      title,
      description,
      rating,
    });

    return res.status(201).json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/averageRating/:userId", async (req, res) => {
  try {
    const response = await reviewController.getAverageRatingByUser(
      req.params.userId,
    );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const response = await reviewController.allReviews();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const response = await reviewController.getReviewById(req.params.id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

module.exports = router;
