const prisma = require("../src/lib/prisma");
const { analyzeImageWithAI } = require("./aiVisionService");

const analyzeOutfit = async ({ clothingType, gender }) => {
  const normalizedType = String(clothingType).toLowerCase();

  if (normalizedType === "tshirt" || normalizedType === "futbolka") {
    return {
      summary: "Bu futbolka casual uslubga mos. Pastel yoki qora rang shim va oq krossovka yaxshi mos keladi.",
      categories: ["pants", "shoes", "cap", "accessory"],
      suggestions: [
        "Slim fit jeans yoki cargo shim",
        "White sneakers",
        "Minimalistik kepka",
        "Soat yoki bracelet"
      ],
      gender,
      style: "casual",
    };
  }

  return {
    summary: "Ushbu kiyim uchun universal tavsiyalar tayyorlandi.",
    categories: ["shoes", "accessory"],
    suggestions: [
      "Classic sneakers",
      "Simple accessory"
    ],
    gender,
    style: "casual",
  };
};
const getPartnerProducts = async ({ categories, gender, style }) => {
  const normalizedGender = gender ? String(gender).toLowerCase() : null;
  const normalizedStyle = style ? String(style).toLowerCase() : null;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stockStatus: "IN_STOCK",
      category: {
        in: categories,
      },
      OR: [
        { gender: normalizedGender },
        { gender: "unisex" },
        { gender: null },
      ],
      store: {
        isActive: true,
        isPartner: true,
      },
    },
    include: {
      store: true,
    },
    take: 50,
  });

  const rankedProducts = products
    .map((product) => {
      let score = 0;

      if (categories.includes(product.category)) {
        score += 30;
      }

      if (normalizedGender && product.gender === normalizedGender) {
        score += 25;
      }

      if (product.gender === "unisex") {
        score += 15;
      }

      if (normalizedStyle && product.style === normalizedStyle) {
        score += 20;
      }

      if (Array.isArray(product.tags) && normalizedStyle && product.tags.includes(normalizedStyle)) {
        score += 10;
      }

      if (product.store.isPartner) {
        score += 20;
      }

      if (product.stockStatus === "IN_STOCK") {
        score += 20;
      }

      score += product.priority || 0;
      score += product.store.priority || 0;

      return {
        ...product,
        matchScore: score,
      };
    })
    .sort((firstProduct, secondProduct) => {
      if (secondProduct.matchScore !== firstProduct.matchScore) {
        return secondProduct.matchScore - firstProduct.matchScore;
      }

      return new Date(secondProduct.createdAt) - new Date(firstProduct.createdAt);
    })
    .slice(0, 20);

  return rankedProducts;
};

const createOutfitRecommendation = async ({
  userId,
  imageId,
  sessionId,
  clothingType,
  gender,
}) => {
  if (!userId) {
    const error = new Error("userId majburiy");
    error.statusCode = 400;
    throw error;
  }

  let analysis;
  let aiAnalysis = null;

  if (imageId) {
    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
        userId,
      },
    });

    if (!image) {
      const error = new Error("Rasm topilmadi");
      error.statusCode = 404;
      throw error;
    }

    const existingRecommendation = await prisma.outfitRecommendation.findFirst({
      where: {
        imageId,
        userId,
        analysisJson: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingRecommendation?.analysisJson) {
      aiAnalysis = existingRecommendation.analysisJson;
    }

    if (!aiAnalysis) {
      aiAnalysis = await analyzeImageWithAI(image.fileUrl);
    }

    analysis = await analyzeOutfit({
      clothingType: aiAnalysis?.clothingType || clothingType,
      gender: aiAnalysis?.gender || gender,
    });

    analysis = {
      ...analysis,
      clothingType: aiAnalysis?.clothingType || clothingType,
      gender: aiAnalysis?.gender || gender,
      color: aiAnalysis?.color || null,
      style: aiAnalysis?.style || analysis.style,
      season: aiAnalysis?.season || null,
      tags: aiAnalysis?.tags || [],
    };
  }

  if (!analysis) {
    analysis = await analyzeOutfit({
      clothingType,
      gender,
    });

    analysis = {
      ...analysis,
      clothingType,
      gender,
      color: null,
      season: null,
      tags: [],
    };
  }

  const products = await getPartnerProducts({
    categories: analysis.categories,
    gender: analysis.gender || gender,
    style: analysis.style,
  });

  const recommendation = await prisma.outfitRecommendation.create({
    data: {
      userId,
      imageId: imageId || null,
      sessionId: sessionId || null,
      summary: analysis.summary,
      recommendedJson: {
        categories: analysis.categories,
        suggestions: analysis.suggestions,
        products: products.map((product) => product.id),
      },
      analysisJson: {
        clothingType: analysis.clothingType,
        gender: analysis.gender,
        color: analysis.color,
        style: analysis.style,
        season: analysis.season,
        tags: analysis.tags,
        categories: analysis.categories,
      },
    },
  });

  return {
    recommendationId: recommendation.id,
    analysis,
    summary: analysis.summary,
    suggestions: analysis.suggestions,
    categories: analysis.categories,
    recommendedProducts: products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      gender: product.gender,
      color: product.color,
      price: product.price,
      currency: product.currency,
      imageUrl: product.imageUrl,
      productUrl: product.productUrl,
      store: {
        id: product.store.id,
        name: product.store.name,
        type: product.store.type,
        phone: product.store.phone,
        address: product.store.address,
        websiteUrl: product.store.websiteUrl,
      },
    })),
  };
};

module.exports = {

  analyzeOutfit,
  getPartnerProducts,
  createOutfitRecommendation,

};