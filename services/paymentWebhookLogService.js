const paymentWebhookLogRepository = require("../repositories/paymentWebhookLogRepository");

const getPaymentWebhookLogs = async () => {
  return await paymentWebhookLogRepository.getPaymentWebhookLogs();
};

module.exports = {
  getPaymentWebhookLogs,
};