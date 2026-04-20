const prisma = require("../src/lib/prisma");

const createImage = async ({
  userId,
  type,
  sessionId,
  fileName,
  fileUrl,
  mimeType,
  size,
}) => {
  if (!userId || !type || !fileName || !fileUrl) {
    const error = new Error("Image yaratish uchun kerakli maydonlar to'liq emas");
    error.statusCode = 400;
    throw error;
  }

  const image = await prisma.image.create({
    data: {
      userId,
      type,
      sessionId: sessionId || null,
      fileName,
      fileUrl,
      mimeType: mimeType || null,
      size: size || null,
    },
  });

  return image;
};
const getUserImages = async (userId) => {
  if (!userId) {
    const error = new Error("User ID topilmadi");
    error.statusCode = 400;
    throw error;
  }

  const images = await prisma.image.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return images;
};
const createResultImage = async ({
  userId,
  sessionId,
  fileName,
  fileUrl,
  mimeType,
  size,
}) => {
  if (!userId || !fileName || !fileUrl) {
    const error = new Error("Result image uchun maydonlar yetarli emas");
    error.statusCode = 400;
    throw error;
  }

  const image = await prisma.image.create({
    data: {
      userId,
      sessionId: sessionId || null,
      type: "result",
      fileName,
      fileUrl,
      mimeType: mimeType || "image/jpeg",
      size: size || null,
    },
  });

  return image;
};
const getUserSessions = async (userId) => {
  const images = await prisma.image.findMany({
    where: {
      userId,
      sessionId: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return images;
};
const getImageById = async (imageId, userId) => {
  if (!imageId || !userId) {
    const error = new Error("Image ID va User ID majburiy");
    error.statusCode = 400;
    throw error;
  }

  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
      userId,
    },
  });

  return image;
};

const deleteImageById = async (imageId, userId) => {
  if (!imageId || !userId) {
    const error = new Error("Image ID va User ID majburiy");
    error.statusCode = 400;
    throw error;
  }

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

  await prisma.image.delete({
    where: {
      id: image.id,
    },
  });

  return image;
};

module.exports = {
  createImage,
  createResultImage,
  getUserImages,
  getUserSessions,
  getImageById,
  deleteImageById,
};

