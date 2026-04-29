const path = require("path");
const { replaceWithOptimizedImage } = require("../services/imageService");
const { createImage } = require("../services/imageDbService");
const { successResponse } = require("../utils/apiResponse");
// eski qismlar yangilandi shuni unutma

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("No file uploaded");
      error.statusCode = 400;
      return next(error);
    }

   const { type, sessionId, clothSize, fitPreference } = req.body;
    if (!type) {
      const error = new Error("Image type majburiy");
      error.statusCode = 400;
      return next(error);
    }

    const originalPath = req.file.path;
    const optimizedPath = await replaceWithOptimizedImage(originalPath);
    const optimizedFileName = path.basename(optimizedPath);
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${optimizedFileName}`;

    const image = await createImage({
  userId: req.user.userId,
  type,
  sessionId,
  fileName: optimizedFileName,
  fileUrl,
  mimeType: req.file.mimetype,
  size: req.file.size,
  clothSize,
  fitPreference,
});

    return successResponse(
      res,
      "File uploaded and optimized successfully",
      {
        image,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};