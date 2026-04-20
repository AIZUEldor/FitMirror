const { successResponse } = require("../utils/apiResponse");

exports.getHome = (req, res) => {
  return successResponse(res, "FitMirror backend is running", {
    app: "FitMirror Backend"
  });
};
//multerjs har doyyim birincgi yozilishi kerak . shun i qo'sh9b qo'y . agar yozilmasa conflictga olib kelishi mumkin . 