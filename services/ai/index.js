const mockProvider = require("./providers/mockProvider");
const replicateProvider = require("./providers/replicateProvider");
const fashnProvider = require("./providers/fashnProvider");

async function generateTryOn({
  personImagePath,
  clothImagePath,
  clothSize = null,
  fitPreference = null,
}) {
  const provider = process.env.TRYON_PROVIDER || "mock";

  const payload = {
    personImagePath,
    clothImagePath,
    clothSize,
    fitPreference,
  };

  if (provider === "replicate") {
    return await replicateProvider.generate(payload);
  }

  if (provider === "fashn") {
    return await fashnProvider.generate(payload);
  }

  return await mockProvider.generate(payload);
}

module.exports = {
  generateTryOn,
};