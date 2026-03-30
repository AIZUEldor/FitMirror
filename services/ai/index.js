const mockProvider = require("./providers/mockProvider");
const replicateProvider = require("./providers/replicateProvider");
const fashnProvider = require("./providers/fashnProvider");

async function generateTryOn({ personImagePath, clothImagePath }) {

  const provider = process.env.TRYON_PROVIDER || "mock";

  if (provider === "replicate") {
    return await replicateProvider.generate({ personImagePath, clothImagePath });
  }

  if (provider === "fashn") {
    return await fashnProvider.generate({ personImagePath, clothImagePath });
  }

  return await mockProvider.generate({ personImagePath, clothImagePath });
}

module.exports = {
  generateTryOn
};