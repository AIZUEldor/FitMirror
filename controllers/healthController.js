const { successResponse } = require("../utils/apiResponse");

exports.getHealth = (req, res) => {
  return successResponse(res, "API is healthy", {
    status: "OK"
  });
};