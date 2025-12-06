const express = require("express");
const userRoutes = require("./users");
const postRoutes = require("./posts");
const { createUser } = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Blog API is running" });
});

router.post("/", asyncHandler(createUser));

router.use("/users", userRoutes);
router.use("/posts", postRoutes);

module.exports = router;
