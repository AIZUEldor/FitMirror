const adService = require("./adService");

const getGenerateWaitingAd = async (req, res, next) => {
  try {
    const ad = await adService.getGenerateWaitingAd();

    return res.status(200).json({
      success: true,
      message: "Generate waiting ad",
      data: ad,
    });
  } catch (error) {
    next(error);
  }
};

const trackImpression = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const { userId, sessionId } = req.body;

    await adService.trackImpression({
      adId,
      userId,
      sessionId,
    });

    return res.status(201).json({
      success: true,
      message: "Ad impression tracked",
    });
  } catch (error) {
    next(error);
  }
};

const trackClick = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const { userId, sessionId } = req.body;

    await adService.trackClick({
      adId,
      userId,
      sessionId,
    });

    return res.status(201).json({
      success: true,
      message: "Ad click tracked",
    });
  } catch (error) {
    next(error);
  }
};

const getAdAnalytics = async (req, res, next) => {
  try {
    const { adId } = req.params;

    const analytics = await adService.getAdAnalytics(adId);

    return res.status(200).json({
      success: true,
      message: "Ad analytics",
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

const getAllAds = async (req, res, next) => {
  try {
    const ads = await adService.getAllAds();

    return res.status(200).json({
      success: true,
      message: "Ads list",
      data: ads,
    });
  } catch (error) {
    next(error);
  }
};

const getAdById = async (req, res, next) => {
  try {
    const { adId } = req.params;

    const ad = await adService.getAdById(adId);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ad detail",
      data: ad,
    });
  } catch (error) {
    next(error);
  }
};

const createAd = async (req, res, next) => {
  try {
    const ad = await adService.createAd(req.body);

    return res.status(201).json({
      success: true,
      message: "Ad created",
      data: ad,
    });
  } catch (error) {
    next(error);
  }
};

const updateAd = async (req, res, next) => {
  try {
    const { adId } = req.params;

    const ad = await adService.updateAd(adId, req.body);

    return res.status(200).json({
      success: true,
      message: "Ad updated",
      data: ad,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAd = async (req, res, next) => {
  try {
    const { adId } = req.params;

    const ad = await adService.deleteAd(adId);

    return res.status(200).json({
      success: true,
      message: "Ad deactivated",
      data: ad,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGenerateWaitingAd,
  trackImpression,
  trackClick,
  getAdAnalytics,
  getAllAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
};