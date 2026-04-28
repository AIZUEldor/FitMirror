const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const analyzeImageWithAI = async (imageUrl) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `
Analyze this outfit image and return ONLY JSON.

Required format:
{
  "clothingType": "",
  "color": "",
  "style": "",
  "season": "",
  "gender": "",
  "tags": []
}

Rules:
- clothingType: tshirt, shirt, pants, jeans, shoes, jacket, dress
- color: main dominant color
- style: casual, sport, classic, streetwear
- season: summer, winter, all-season
- gender: male, female, unisex
- tags: short keywords (max 5)

Return ONLY JSON. No explanation.
`;

  const result = await model.generateContent([
    prompt,
    {
      fileData: {
        fileUri: imageUrl,
        mimeType: "image/jpeg",
      },
    },
  ]);

  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch (parseError) {
    return null;
  }
};

module.exports = {
  analyzeImageWithAI,
};