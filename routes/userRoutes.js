const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUsers,
  registerUser,
  loginUser,
  googleLogin,
  getMe,
  getMyImages,
  getMySessions,
  upgradePlan,
  buyCredits,
  getDevices,
  deleteDevice,
  deleteImage,
  createTestPayment,
  updatePayment,
  getMyPayments

} = require("../controllers/userController");


router.get("/", getUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.get("/me", protect, getMe);
router.get("/images", protect, getMyImages);
router.get("/sessions", protect, getMySessions);
router.post("/upgrade-plan", protect, upgradePlan);
router.post("/buy-credits", protect, buyCredits);
router.post("/payments/test", protect, createTestPayment);
router.put("/payments/:paymentId", protect, updatePayment);
router.get("/payments", protect, getMyPayments);
router.get("/devices", protect, getDevices);
router.delete("/devices/:deviceId", protect, deleteDevice);
router.delete("/images/:imageId", protect, deleteImage);

module.exports = router;