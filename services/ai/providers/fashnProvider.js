const fs = require("fs");

const FASHN_API_URL = "https://api.fashn.ai/v1";

function fileToBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const ext = filePath.toLowerCase().endsWith(".png") ? "png" : "jpeg";
  return `data:image/${ext};base64,${fileBuffer.toString("base64")}`;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generate({ personImagePath, clothImagePath }) {
  const apiKey = process.env.FASHN_API_KEY;

  if (!apiKey) {
    throw new Error("FASHN_API_KEY topilmadi");
  }

  const modelImageBase64 = fileToBase64(personImagePath);
  const productImageBase64 = fileToBase64(clothImagePath);

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };

  const runResponse = await fetch(`${FASHN_API_URL}/run`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model_name: "tryon-max",
      inputs: {
        model_image: modelImageBase64,
        product_image: productImageBase64,
        output_format: "png",
        num_images: 1,
        resolution: "1k"
      }
    })
  });

  const runData = await runResponse.json();

  if (!runResponse.ok) {
    throw new Error(runData?.error || runData?.message || "FASHN run request xato berdi");
  }

  if (!runData.id) {
    throw new Error("FASHN prediction id qaytmadi");
  }

  const predictionId = runData.id;

  for (let i = 0; i < 40; i++) {
    await sleep(3000);

    const statusResponse = await fetch(`${FASHN_API_URL}/status/${predictionId}`, {
      method: "GET",
      headers
    });

    const statusData = await statusResponse.json();

    if (!statusResponse.ok) {
      throw new Error(statusData?.error || statusData?.message || "FASHN status request xato berdi");
    }

    if (statusData.status === "completed") {
      const outputUrl = Array.isArray(statusData.output) ? statusData.output[0] : null;

      if (!outputUrl) {
        throw new Error("FASHN completed bo‘ldi, lekin output URL topilmadi");
      }

      return {
        success: true,
        mode: "real-ai",
        provider: "fashn",
        resultImage: outputUrl,
        resultUrl: outputUrl
      };
    }

    if (["failed", "cancelled"].includes(statusData.status)) {
      throw new Error(statusData.error || `FASHN status: ${statusData.status}`);
    }
  }

  throw new Error("FASHN timeout: natija juda uzoq keldi");
}

module.exports = {
  generate
};