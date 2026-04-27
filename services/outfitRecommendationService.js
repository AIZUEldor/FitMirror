const prisma = require("../src/lib/prisma");

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
  };
};

const getPartnerProducts = async ({ categories, gender }) => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        in: categories,
      },
      OR: [
        { gender },
        { gender: "unisex" },
        { gender: null },
      ],
      store: {
        isActive: true,
      },
    },
    include: {
      store: true,
    },
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
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

  const analysis = await analyzeOutfit({
    clothingType,
    gender,
  });

  const products = await getPartnerProducts({
    categories: analysis.categories,
    gender,
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
    },
  });

  return {
  recommendationId: recommendation.id,
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