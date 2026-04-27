const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const paymentWebhookLogController = require("../controllers/paymentWebhookLogController");
const outfitRecommendationController = require("../controllers/outfitRecommendationController");
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
  clickWebhook,
  paymeWebhook,
  stripeWebhook,
  getPricing,
  createCheckout,
  getMyPayments,
  getPaymentProviders,

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
router.post("/payments/click/webhook", clickWebhook);
router.post("/payments/payme/webhook", paymeWebhook);
router.post("/payments/stripe/webhook", stripeWebhook);
router.get("/payments/pricing", getPricing);
router.get("/payments/providers", getPaymentProviders);
router.post("/payments/checkout", protect, createCheckout);
router.get("/devices", protect, getDevices);
router.delete("/devices/:deviceId", protect, deleteDevice);
router.delete("/images/:imageId", protect, deleteImage);
router.get(
  "/payments/webhook-logs",
  protect,
  paymentWebhookLogController.getPaymentWebhookLogs
);
router.post(
  "/outfit/recommendation",
  protect,
  outfitRecommendationController.createRecommendation
);

module.exports = router;