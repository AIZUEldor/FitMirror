const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const { generateTryOnImage } = require("../services/aiService");
const { replaceWithOptimizedImage } = require("../services/imageService");
const { successResponse } = require("../utils/apiResponse");
const { createResultImage } = require("../services/imageDbService");
const { getImageById } = require("../services/imageDbService");

function createHttpError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function extractFileName(fileUrl) {
  return fileUrl.split("/").pop();
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
async function resolveImagePath({ tempPath, imageId, userId }) {
  if (tempPath) {
    return tempPath;
  }

  if (!imageId) {
    throw createHttpError("Image file yoki imageId majburiy", 400);
  }

  const image = await getImageById(imageId, userId);

  if (!image) {
    throw createHttpError("Image topilmadi", 404);
  }

  const uploadsPrefix = "/uploads/";

  if (!image.fileUrl.includes(uploadsPrefix)) {
    throw createHttpError("Faqat local upload qilingan rasmlar generate uchun ishlatiladi", 400);
  }

  const fileName = image.fileUrl.split(uploadsPrefix).pop();
  return path.join(process.cwd(), "uploads", fileName);
}

exports.generateTryOn = async (req, res, next) => {
  let personTempPath;
  let clothTempPath;
  let personSourcePath;
  let clothSourcePath;
  let optimizedPersonPath;
  let optimizedClothPath;

  try {
    const { personFile, clothFile, personImageId, clothImageId } =
  await getInputSources(req);
    async function getInputSources(req) {
  const personFiles = req.files?.personImage;
  const clothFiles = req.files?.clothImage;

  const personFile = Array.isArray(personFiles) && personFiles.length > 0
    ? personFiles[0]
    : null;

  const clothFile = Array.isArray(clothFiles) && clothFiles.length > 0
    ? clothFiles[0]
    : null;

  const { personImageId, clothImageId } = req.body;

  return {
    personFile,
    clothFile,
    personImageId,
    clothImageId,
  };
}

    if (personFile) {
  personTempPath = await writeBufferToTempFile(personFile);
}

if (clothFile) {
  clothTempPath = await writeBufferToTempFile(clothFile);
}
personSourcePath = await resolveImagePath({
  tempPath: personTempPath,
  imageId: personImageId,
  userId: req.user.userId,
});

clothSourcePath = await resolveImagePath({
  tempPath: clothTempPath,
  imageId: clothImageId,
  userId: req.user.userId,
});

optimizedPersonPath = await replaceWithOptimizedImage(personSourcePath);
optimizedClothPath = await replaceWithOptimizedImage(clothSourcePath);
    const sessionId = req.body.sessionId || crypto.randomUUID();
    const result = await generateTryOnImage(
      optimizedPersonPath,
      optimizedClothPath
    );

    const resultFileName = extractFileName(result.resultUrl);

   await createResultImage({
  userId: req.user.userId,
  sessionId,
  fileName: resultFileName,
  fileUrl: result.resultUrl,
  mimeType: "image/png",
  size: null,
});

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

   if (
  optimizedPersonPath &&
  optimizedPersonPath !== personTempPath &&
  optimizedPersonPath !== personSourcePath
) {
  await safeDeleteFile(optimizedPersonPath);
}

if (
  optimizedClothPath &&
  optimizedClothPath !== clothTempPath &&
  optimizedClothPath !== clothSourcePath
) {
  await safeDeleteFile(optimizedClothPath);
}
  }
};