const express = require("express");
const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", asyncHandler(createPost));
router.get("/", asyncHandler(listPosts));
router.get("/:id", asyncHandler(getPostById));
router.put("/:id", asyncHandler(updatePost));
router.delete("/:id", asyncHandler(deletePost));

module.exports = router;
