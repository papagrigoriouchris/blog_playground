const express = require("express");
const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const asyncHandler = require("../utils/asyncHandler");
const { requireRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/", asyncHandler(createPost));
router.get("/", asyncHandler(listPosts));
router.get("/:id", asyncHandler(getPostById));
router.put("/:id", requireRoles("ADMIN"), asyncHandler(updatePost));
router.delete("/:id", requireRoles("ADMIN"), asyncHandler(deletePost));

module.exports = router;
