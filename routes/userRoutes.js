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
  upgradePlan,
  buyCredits,
  getDevices,
  deleteDevice,
  deleteImage
} = require("../controllers/userController");


router.get("/", getUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/images", protect, getMyImages);
router.get("/sessions", protect, getMySessions);
router.post("/upgrade-plan", protect, upgradePlan);
router.post("/buy-credits", protect, buyCredits);
router.get("/devices", protect, getDevices);
router.delete("/devices/:deviceId", protect, deleteDevice);
router.delete("/images/:imageId", protect, deleteImage);

module.exports = router;