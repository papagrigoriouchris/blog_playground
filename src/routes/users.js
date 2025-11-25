const express = require("express");
const { createUser, getUserById, getUsers, loginUser } = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");
const { requireRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/", asyncHandler(createUser));
router.post("/login", asyncHandler(loginUser));
router.get("/:id", requireRoles("ADMIN"), asyncHandler(getUserById));
router.get("/", requireRoles("ADMIN"), asyncHandler(getUsers));

module.exports = router;
