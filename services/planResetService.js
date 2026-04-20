const prisma = require("../src/lib/prisma");
const { PLAN_LIMITS } = require("../config/planLimits");

const resetMonthlyPlans = async () => {
  const now = new Date();

  const expiredUsers = await prisma.user.updateMany({
    where: {
      plan: {
        not: "FREE",
      },
      planExpiresAt: {
        lte: now,
      },
    },
    data: {
      plan: "FREE",
      monthlyGenerationLimit: PLAN_LIMITS.FREE,
      monthlyGenerationUsed: 0,
      planStartedAt: null,
      planExpiresAt: null,
    },
  });

  const activeUsersReset = await prisma.user.updateMany({
    where: {
      plan: {
        not: "FREE",
      },
      planExpiresAt: {
        gt: now,
      },
    },
    data: {
      monthlyGenerationUsed: 0,
    },
  });

  const freeUsersReset = await prisma.user.updateMany({
    where: {
      plan: "FREE",
    },
    data: {
      monthlyGenerationLimit: PLAN_LIMITS.FREE,
      monthlyGenerationUsed: 0,
    },
  });

  return {
    expiredUsersUpdated: expiredUsers.count,
    activeUsersReset: activeUsersReset.count,
    freeUsersReset: freeUsersReset.count,
  };
};

module.exports = {
  resetMonthlyPlans,
};