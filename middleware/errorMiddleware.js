const multer = require("multer");
const { errorResponse } = require("../utils/apiResponse");

const errorMiddleware = (err, req, res, next) => {
  console.error("Error:", err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return errorResponse(res, "File size too large. Max size is 10MB", {}, 400);
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return errorResponse(res, "Unexpected field name", {}, 400);
    }

    return errorResponse(res, err.message || "Multer error", {}, 400);
  }

  const statusCode = err.statusCode || 500;

  return errorResponse(
    res,
    err.message || "Internal Server Error",
    {
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    },
    statusCode
  );
};

module.exports = errorMiddleware;