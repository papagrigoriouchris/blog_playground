const express = require("express");
const userRoutes = require("./users");
const postRoutes = require("./posts");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Blog API is running" });
});

router.use("/users", userRoutes);
router.use("/posts", postRoutes);

module.exports = router;
