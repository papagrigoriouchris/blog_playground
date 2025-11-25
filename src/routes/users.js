const express = require("express");
const { createUser, getUserById, getUsers, loginUser } = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", asyncHandler(createUser));
router.post("/login", asyncHandler(loginUser));
router.get("/:id", asyncHandler(getUserById));
router.get("/", asyncHandler(getUsers));

module.exports = router;
