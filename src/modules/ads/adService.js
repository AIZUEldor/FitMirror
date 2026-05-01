const prisma = require("../../lib/prisma");

const getGenerateWaitingAd = async () => {
  const now = new Date();

  const ad = await prisma.ad.findFirst({
    where: {
      placement: "GENERATE_WAITING",
      status: "ACTIVE",
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [
        {
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      ],
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: {
      store: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          websiteUrl: true,
        },
      },
    },
  });

  return ad;
};

const trackImpression = async ({ adId, userId, sessionId }) => {
  await prisma.adImpression.create({
    data: {
      adId,
      userId,
      sessionId,
    },
  });
};

const trackClick = async ({ adId, userId, sessionId }) => {
  await prisma.adClick.create({
    data: {
      adId,
      userId,
      sessionId,
    },
  });
};

const getAdAnalytics = async (adId) => {
  const impressions = await prisma.adImpression.count({
    where: { adId },
  });

  const clicks = await prisma.adClick.count({
    where: { adId },
  });

  const ctr = impressions === 0 ? 0 : Number(((clicks / impressions) * 100).toFixed(2));

  return {
    adId,
    impressions,
    clicks,
    ctr,
  };
};

const getAllAds = async () => {
  const ads = await prisma.ad.findMany({
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      store: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          websiteUrl: true,
        },
      },
    },
  });

  return ads;
};

const getAdById = async (adId) => {
  const ad = await prisma.ad.findUnique({
    where: { id: adId },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          websiteUrl: true,
        },
      },
    },
  });

  return ad;
};

const createAd = async (data) => {
  const ad = await prisma.ad.create({
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      targetUrl: data.targetUrl,
      placement: data.placement || "GENERATE_WAITING",
      status: data.status || "ACTIVE",
      priority: data.priority || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      storeId: data.storeId || null,
    },
  });

  return ad;
};

const updateAd = async (adId, data) => {
  const ad = await prisma.ad.update({
    where: { id: adId },
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      targetUrl: data.targetUrl,
      placement: data.placement,
      status: data.status,
      priority: data.priority,
      startDate: data.startDate,
      endDate: data.endDate,
      storeId: data.storeId,
    },
  });

  return ad;
};

const deleteAd = async (adId) => {
  const ad = await prisma.ad.update({
    where: { id: adId },
    data: {
      status: "INACTIVE",
    },
  });

  return ad;
};

module.exports = {
  getGenerateWaitingAd,
  trackImpression,
  trackClick,
  getAdAnalytics,
  getAllAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
};