const express = require("express");
const router = express.Router();
const cloudinary = require("../../config/Cloudinary.js");

const postsController = require("../../controllers/postsControllers.js");
const authorization = require("../../middleware/authorization");
const isAdmin = require("../../middleware/isAdmin");
const isPostOwnerOrAdmin = require("../../middleware/isPostOwnerOrAdmin");

// Listado público (navegar publicaciones no requiere estar logueado)
router.get("/", async (req, res) => {
  try {
    const posts = await postsController.getAllPosts();
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get(
  "/allDisabledPosts",
  authorization,
  isAdmin,
  async (req, res) => {
    try {
      const response = await postsController.getAllDisabled();
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },
);

router.get(
  "/allExistingPosts",
  authorization,
  isAdmin,
  async (req, res) => {
    try {
      const response = await postsController.getAllExisting();
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },
);

router.get("/categories/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const response = await postsController.getPostsByCategory(category);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get("/provincia/:provincia", async (req, res) => {
  const { provincia } = req.params;
  try {
    const response = await postsController.getPostsByProvince(provincia);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

router.get("/localidad/:localidad", async (req, res) => {
  const { localidad } = req.params;
  try {
    const response = await postsController.getPostsByLocality(localidad);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

// Requiere login: evita que cualquiera obtenga firmas de subida a Cloudinary.
// OJO: esta ruta y "/userPosts/:userId" deben ir ANTES de "/:id" o Express
// va a interpretar "cloudinary"/"userPosts" como si fueran un :id (bug que
// tenía el proyecto original).
router.get("/cloudinary/signature", authorization, (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: "postimages",
    },
    process.env.API_SECRET,
  );

  res.json({
    timestamp,
    signature,
    apiKey: process.env.API_KEY,
    cloudName: process.env.CLOUD_NAME,
  });
});

router.get("/userPosts/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userPosts = await postsController.getPostsByUserId(userId);
    return res.status(200).json(userPosts);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postById = await postsController.getPostById(id);
    return res.status(200).json(postById);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

// Crear una publicación requiere estar logueado; el post queda asociado
// al usuario del token, nunca a un UserId que mande el cliente.
router.post("/", authorization, async (req, res) => {
  const postData = { ...req.body, UserId: req.body.user };
  try {
    const newPost = await postsController.createPost(postData);
    return res.status(201).json(newPost);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.put(
  "/:id",
  authorization,
  isPostOwnerOrAdmin,
  async (req, res) => {
    const { id } = req.params;
    // Nunca permitir que el cliente cambie el dueño del post
    const { UserId, ...updatedData } = req.body;
    try {
      const updatedPost = await postsController.updatePost(id, updatedData);
      return res.status(200).json({ message: "Resource updated successfully" });
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },
);

router.delete(
  "/deletePost/:id",
  authorization,
  isPostOwnerOrAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const deletedPost = await postsController.deletePost(id);

      if (deletedPost) {
        return res.status(200).json("Post successfully deleted");
      } else {
        return res.status(404).json("Post not found");
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: "There was an error deleting the post" });
    }
  },
);

router.put(
  "/restorePost/:id",
  authorization,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const restoredPost = await postsController.restorePost(id);
      return res.status(200).json({ restoredPost });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
);

router.put(
  "/disablePost/:id",
  authorization,
  isPostOwnerOrAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const disabledPost = await postsController.disablePost(id);
      return res.status(200).json({ disabledPost });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
);

module.exports = router;
