const ai = require("./ai");

exports.generateTryOnImage = async (personImagePath, clothImagePath) => {
  return await ai.generateTryOn({ personImagePath, clothImagePath });
};