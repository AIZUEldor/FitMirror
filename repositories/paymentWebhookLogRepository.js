const prisma = require("../src/lib/prisma");

const getPaymentWebhookLogs = async () => {
  return await prisma.paymentWebhookLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

module.exports = {
  getPaymentWebhookLogs,
};