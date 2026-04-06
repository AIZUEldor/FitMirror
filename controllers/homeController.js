const { successResponse } = require("../utils/apiResponse");

exports.getHome = (req, res) => {
  return successResponse(res, "FitMirror backend is running", {
    app: "FitMirror Backend"
  });
};