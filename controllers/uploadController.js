const path = require("path");
const { replaceWithOptimizedImage } = require("../services/imageService");
const { successResponse } = require("../utils/apiResponse");

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("No file uploaded");
      error.statusCode = 400;
      return next(error);
    }

    const originalPath = req.file.path;
    const optimizedPath = await replaceWithOptimizedImage(originalPath);
    const optimizedFileName = path.basename(optimizedPath);

    return successResponse(
      res,
      "File uploaded and optimized successfully",
      {
        fileName: optimizedFileName,
        fileUrl: `${req.protocol}://${req.get("host")}/uploads/${optimizedFileName}`
      },
      200
    );
  } catch (error) {
    next(error);
  }
};