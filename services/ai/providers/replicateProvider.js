const Replicate = require("replicate");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generate({ personImagePath, clothImagePath }) {
  try {
    console.log("Replicate provider started");
    console.log("Person image:", personImagePath);
    console.log("Cloth image:", clothImagePath);

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: "a fashion model wearing stylish modern clothing, studio photo"
        }
      }
    );

    const firstFile = Array.isArray(output) ? output[0] : output;
    const imageUrl =
      firstFile && typeof firstFile.url === "function"
        ? firstFile.url()
        : null;

    return {
      success: true,
      mode: "real-ai",
      provider: "replicate",
      resultImage: imageUrl,
      resultUrl: imageUrl
    };
  } catch (error) {
    console.error("Replicate provider error:", error.message);
    throw error;
  }
}

module.exports = {
  generate
};