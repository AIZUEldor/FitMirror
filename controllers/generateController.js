const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const { generateTryOnImage } = require("../services/aiService");
const { replaceWithOptimizedImage } = require("../services/imageService");
const { successResponse } = require("../utils/apiResponse");

function createHttpError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getSingleFile(req, fieldName) {
  const files = req.files?.[fieldName];

  if (!Array.isArray(files) || files.length === 0) {
    throw createHttpError(`${fieldName} majburiy`, 400);
  }

  return files[0];
}

function getExtensionFromMimeType(mimeType) {
  const mimeToExtensionMap = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
  };

  return mimeToExtensionMap[mimeType] || ".jpg";
}

async function writeBufferToTempFile(file) {
  if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
    throw createHttpError("Yuklangan fayl buffer formatida kelmadi", 400);
  }

  const extension = getExtensionFromMimeType(file.mimetype);
  const tempFileName = `fitmirror-${crypto.randomUUID()}${extension}`;
  const tempFilePath = path.join(os.tmpdir(), tempFileName);

  await fs.writeFile(tempFilePath, file.buffer);

  return tempFilePath;
}

async function safeDeleteFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch {
  }
}

exports.generateTryOn = async (req, res, next) => {
  let personTempPath;
  let clothTempPath;
  let optimizedPersonPath;
  let optimizedClothPath;

  try {
    const personFile = getSingleFile(req, "personImage");
    const clothFile = getSingleFile(req, "clothImage");

    personTempPath = await writeBufferToTempFile(personFile);
    clothTempPath = await writeBufferToTempFile(clothFile);

    optimizedPersonPath = await replaceWithOptimizedImage(personTempPath);
    optimizedClothPath = await replaceWithOptimizedImage(clothTempPath);

    const result = await generateTryOnImage(
      optimizedPersonPath,
      optimizedClothPath
    );

    const cleanedResult = {
      mode: result.mode,
      resultImage: result.resultImage,
      resultUrl: result.resultUrl,
      note: result.note,
    };

    return successResponse(
      res,
      "Try-on generated successfully",
      cleanedResult,
      200
    );
  } catch (error) {
    return next(error);
  } finally {
    await safeDeleteFile(personTempPath);
    await safeDeleteFile(clothTempPath);

    if (optimizedPersonPath && optimizedPersonPath !== personTempPath) {
      await safeDeleteFile(optimizedPersonPath);
    }

    if (optimizedClothPath && optimizedClothPath !== clothTempPath) {
      await safeDeleteFile(optimizedClothPath);
    }
  }
};