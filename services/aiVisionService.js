const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const normalizeValue = (value) => {
  return typeof value === "string" ? value.trim().toLowerCase() : null;
};

const normalizeClothingType = (value) => {
  const normalized = normalizeValue(value);

  const allowedValues = {
    tshirt: "tshirt",
    "t-shirt": "tshirt",
    tee: "tshirt",
    shirt: "shirt",
    pants: "pants",
    trousers: "pants",
    jeans: "jeans",
    shoes: "shoes",
    sneakers: "shoes",
    jacket: "jacket",
    coat: "jacket",
    dress: "dress",
  };

  return allowedValues[normalized] || null;
};

const normalizeColor = (value) => {
  const normalized = normalizeValue(value);

  const allowedValues = {
    black: "black",
    white: "white",
    blue: "blue",
    red: "red",
    green: "green",
    gray: "gray",
    grey: "gray",
    brown: "brown",
    beige: "brown",
  };

  return allowedValues[normalized] || null;
};

const normalizeStyle = (value) => {
  const normalized = normalizeValue(value);

  const allowedValues = {
    casual: "casual",
    sport: "sport",
    sporty: "sport",
    classic: "classic",
    formal: "classic",
    streetwear: "streetwear",
    street: "streetwear",
  };

  return allowedValues[normalized] || null;
};

const normalizeSeason = (value) => {
  const normalized = normalizeValue(value);

  const allowedValues = {
    summer: "summer",
    winter: "winter",
    "all-season": "all-season",
    allseason: "all-season",
    spring: "all-season",
    autumn: "all-season",
    fall: "all-season",
  };

  return allowedValues[normalized] || "all-season";
};

const normalizeGender = (value) => {
  const normalized = normalizeValue(value);

  const allowedValues = {
    male: "male",
    men: "male",
    man: "male",
    female: "female",
    women: "female",
    woman: "female",
    unisex: "unisex",
  };

  return allowedValues[normalized] || "unisex";
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter((tag) => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);
};

const analyzeImageWithAI = async (imageUrl) => {
  const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

 const prompt = `
You are a professional fashion stylist AI.

Analyze the outfit image and return STRICT JSON only.

JSON format:
{
  "clothingType": "",
  "color": "",
  "style": "",
  "season": "",
  "gender": "",
  "tags": []
}

Rules:

1. clothingType MUST be one of:
tshirt, shirt, pants, jeans, shoes, jacket, dress

2. color:
- choose ONE dominant color
- use simple names: black, white, blue, red, green, gray, brown

3. style MUST be one of:
casual, sport, classic, streetwear

4. season MUST be one of:
summer, winter, all-season

5. gender MUST be one of:
male, female, unisex

6. tags:
- max 5 items
- short keywords only
- no sentences

7. DO NOT return explanation
8. DO NOT wrap in markdown
9. RETURN ONLY JSON

Be precise and consistent.
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

// JSON ni ajratib olish
const jsonMatch = text.match(/\{[\s\S]*\}/);

if (!jsonMatch) {
  return null;
}

try {
  const parsed = JSON.parse(jsonMatch[0]);

  // basic validation
 return {
  clothingType: normalizeClothingType(parsed.clothingType),
  color: normalizeColor(parsed.color),
  style: normalizeStyle(parsed.style),
  season: normalizeSeason(parsed.season),
  gender: normalizeGender(parsed.gender),
  tags: normalizeTags(parsed.tags),
};
} catch (error) {
  return null;
}
};

module.exports = {
  analyzeImageWithAI,
};