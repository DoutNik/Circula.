const { Review, User } = require("../DB_config");

const createReview = async ({
  userId,
  reviewedUserId,
  title,
  description,
  rating,
}) => {
  return Review.sequelize.transaction(async (transaction) => {
    const reviewer = await User.findByPk(userId, { transaction });
    const reviewedUser = await User.findByPk(reviewedUserId, {
      transaction,
    });

    if (!reviewer) {
      throw new Error("Usuario autor no encontrado.");
    }

    if (!reviewedUser) {
      throw new Error("Usuario a calificar no encontrado.");
    }

    if (Number(userId) === Number(reviewedUserId)) {
      throw new Error("No puedes calificarte a ti mismo.");
    }

    const existingReview = await Review.findOne({
      where: { userId, reviewedUserId },
      transaction,
    });

    if (existingReview) {
      throw new Error("Ya has calificado a este usuario.");
    }

    const review = await Review.create(
      {
        userId,
        reviewedUserId,
        title: title.trim(),
        description: description.trim(),
        rating: Number(rating),
      },
      { transaction },
    );

    const reviews = await Review.findAll({
      where: { reviewedUserId },
      attributes: ["rating"],
      transaction,
    });

    const averageRating =
      reviews.reduce((total, current) => total + current.rating, 0) /
      reviews.length;

    const roundedAverage = Number(averageRating.toFixed(2));

    await reviewedUser.update(
      { averageRating: roundedAverage },
      { transaction },
    );

    return {
      review,
      averageRating: roundedAverage,
    };
  });
};

const allReviews = async () => {
  return Review.findAll({
    order: [["createdAt", "DESC"]],
  });
};

const getReviewById = async (reviewId) => {
  const review = await Review.findByPk(reviewId);

  if (!review) {
    throw new Error("Reseña no encontrada.");
  }

  return review;
};

const getAverageRatingByUser = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "averageRating"],
  });

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  return {
    averageRating: Number(user.averageRating) || 0,
  };
};

module.exports = {
  createReview,
  allReviews,
  getReviewById,
  getAverageRatingByUser,
};