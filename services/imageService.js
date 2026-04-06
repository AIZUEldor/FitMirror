const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

exports.optimizeImage = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
};

exports.replaceWithOptimizedImage = async (filePath) => {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, ext);

  const optimizedPath = path.join(dir, `${baseName}-optimized.jpg`);

  await sharp(filePath)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(optimizedPath);

  fs.unlinkSync(filePath);

  return optimizedPath;
};