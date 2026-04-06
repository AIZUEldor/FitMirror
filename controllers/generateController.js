const { generateTryOnImage } = require("../services/aiService");
const { replaceWithOptimizedImage } = require("../services/imageService");
const { successResponse } = require("../utils/apiResponse");

exports.generateTryOn = async (req, res, next) => {
  try {
    if (!req.files || !req.files.personImage || !req.files.clothImage) {
      const error = new Error("personImage va clothImage majburiy");
      error.statusCode = 400;
      return next(error);
    }

    const personFile = req.files.personImage[0];
    const clothFile = req.files.clothImage[0];

    const optimizedPersonPath = await replaceWithOptimizedImage(personFile.path);
    const optimizedClothPath = await replaceWithOptimizedImage(clothFile.path);

    const result = await generateTryOnImage(optimizedPersonPath, optimizedClothPath);

    const cleanedResult = {
      mode: result.mode,
      resultImage: result.resultImage,
      resultUrl: result.resultUrl,
      note: result.note
    };

    return successResponse(
      res,
      "Try-on generated successfully",
      cleanedResult,
      200
    );
  } catch (error) {
    next(error);
  }
};