const paymentWebhookLogRepository = require("../repositories/paymentWebhookLogRepository");
const prisma = require("../src/lib/prisma");

const getPaymentWebhookLogs = async () => {
  return await paymentWebhookLogRepository.getPaymentWebhookLogs();
};

const createWebhookLog = async ({
  provider,
  paymentId,
  status,
  rawBody,
}) => {
  return await prisma.paymentWebhookLog.create({
    data: {
      provider,
      paymentId,
      status,
      rawBody,
    },
  });
};

module.exports = {
  getPaymentWebhookLogs,
  createWebhookLog,
};