const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUsers,
  registerUser,
  loginUser,
  getMe,
  getMyImages,
  getMySessions,
} = require("../controllers/userController");

router.get("/", getUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/images", protect, getMyImages);
router.get("/sessions", protect, getMySessions);

module.exports = router;