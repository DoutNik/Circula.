const { Post, User } = require("../DB_config");

// Debe usarse SIEMPRE después de `authorization`.
module.exports = async (req, res, next) => {
  try {
    const requesterId = String(req.body.user);
    const post = await Post.findByPk(req.params.id, { paranoid: false });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (String(post.UserId) === requesterId) {
      req.post = post;
      return next();
    }

    const user = await User.findByPk(requesterId);
    if (user && user.rol === "admin") {
      req.post = post;
      return next();
    }

    return res.status(403).json("Not Authorize - Not the owner of this post");
  } catch (error) {
    console.error("Error isPostOwnerOrAdmin:", error.message);
    return res.status(500).json("Error checking permissions");
  }
};
