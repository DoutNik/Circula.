const { Review, User } = require("../DB_config");

const createReview = async ({ userId, reviewedUserId, rating }) => {
  const existing = await Review.findAll({
    where: { userId, reviewedUserId },
  });

  if (existing.length !== 0) {
    throw new Error("Ya haz calificado a este usuario");
  }

  const newReview = await Review.create({ userId, reviewedUserId, rating });
  return newReview;
};

const allReviews = async () => {
  const reviews = await Review.findAll();
  return reviews;
};

const getReviewById = async (reviewId) => {
  const review = await Review.findByPk(reviewId);
  if (!review) {
    throw new Error("Review no encontrada.");
  }
  return review;
};

const getAverageRatingByUser = async (userId) => {
  const result = await Review.findAll({ where: { reviewedUserId: userId } });

  if (!result || result.length === 0) {
    throw new Error("No se encontraron reseñas para este usuario");
  }

  const ratings = result.map((element) => element.rating);
  const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
  const averageRating = totalRating / ratings.length;

  await User.update({ averageRating }, { where: { id: userId } });

  return { averageRating };
};

module.exports = {
  createReview,
  allReviews,
  getReviewById,
  getAverageRatingByUser,
};
