const multer = require("multer");

// memory storage
const storage = multer.memoryStorage();

// file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error("Faqat JPG yoki PNG rasm yuborish mumkin");
    error.statusCode = 400;
    cb(error, false);
  }
};

// limits
const limits = {
  fileSize: 10 * 1024 * 1024
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

module.exports = upload;