const express = require("express");
const router = express.Router();

const adController = require("./adController");

router.get("/generate-waiting", adController.getGenerateWaitingAd);
router.post("/:adId/impression", adController.trackImpression);
router.post("/:adId/click", adController.trackClick);
router.get("/:adId/analytics", adController.getAdAnalytics);
router.get("/", adController.getAllAds);
router.get("/:adId", adController.getAdById);
router.post("/", adController.createAd);
router.put("/:adId", adController.updateAd);
router.delete("/:adId", adController.deleteAd);

module.exports = router;