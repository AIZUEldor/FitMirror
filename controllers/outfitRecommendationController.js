const {
  createOutfitRecommendation,
} = require("../services/outfitRecommendationService");

exports.createRecommendation = async (req, res, next) => {
  try {
    const result = await createOutfitRecommendation({
      userId: req.user.userId,
      imageId: req.body.imageId,
      sessionId: req.body.sessionId,
      clothingType: req.body.clothingType,
      gender: req.body.gender,
    });

    return res.status(201).json({
      success: true,
      message: "Outfit tavsiya yaratildi",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};