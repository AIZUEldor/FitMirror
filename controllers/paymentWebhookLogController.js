const paymentWebhookLogService = require("../services/paymentWebhookLogService");

const getPaymentWebhookLogs = async (req, res, next) => {
  try {
    const webhookLogs = await paymentWebhookLogService.getPaymentWebhookLogs();

    return res.status(200).json({
      success: true,
      message: "Webhook loglar olindi",
      data: webhookLogs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentWebhookLogs,
};