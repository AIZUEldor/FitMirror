const fs = require("fs");
const path = require("path");

async function generate({ personImagePath, clothImagePath }) {
  try {
    const fileName = "generated_" + Date.now() + ".jpg";
    const outputPath = path.join(__dirname, "../../../generated", fileName);

    fs.copyFileSync(personImagePath, outputPath);

    return {
      success: true,
      mode: "mock-fallback",
      resultImage: fileName,
      resultUrl: `/generated/${fileName}`,
      note: "Hozircha mock provider ishladi, person image nusxasi qaytarildi"
    };
  } catch (error) {
    return {
      success: false,
      mode: "mock-fallback",
      message: "Mock provider xatolik berdi",
      error: error.message
    };
  }
}

module.exports = {
  generate
};