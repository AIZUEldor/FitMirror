const ai = require("./ai");

exports.generateTryOnImage = async (
  personImagePath,
  clothImagePath,
  clothSize,
  fitPreference
) => {
  return await ai.generateTryOn({
    personImagePath,
    clothImagePath,
    clothSize,
    fitPreference
  });
};

