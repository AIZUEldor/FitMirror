const clickConfig = require("../../config/clickConfig");
const { createWebhookLog } = require("../paymentWebhookLogService");
const { updatePaymentStatus } = require("../userService");

const CLICK_PROVIDER = "CLICK";

const normalizeClickStatus = (paymentStatus) => {
  const normalizedStatus = String(paymentStatus).toUpperCase();

  if (normalizedStatus === "SUCCESS" || normalizedStatus === "COMPLETED") {
    return "PAID";
  }

  return normalizedStatus;
};

const extractClickPaymentData = (body) => {
  return {
    paymentId:
      body.payment_id ||
      body.paymentId ||
      body.merchant_trans_id,

    paymentStatus:
      body.status ||
      body.payment_status ||
      body.status_note,
  };
};

const validateClickSecret = (headers) => {
  const incomingSecret = headers["x-click-secret"];

  if (incomingSecret !== clickConfig.webhookSecret) {
    const error = new Error("Unauthorized webhook");
    error.statusCode = 401;
    throw error;
  }
};

const validateClickPaymentData = ({ paymentId, paymentStatus }) => {
  if (!paymentId || !paymentStatus) {
    const error = new Error("paymentId va status topilmadi");
    error.statusCode = 400;
    throw error;
  }
};

const handleClickWebhook = async ({ headers, body }) => {
  validateClickSecret(headers);

  const paymentData = extractClickPaymentData(body);

  validateClickPaymentData(paymentData);

  const normalizedStatus = normalizeClickStatus(paymentData.paymentStatus);

  await createWebhookLog({
    provider: CLICK_PROVIDER,
    paymentId: paymentData.paymentId,
    status: normalizedStatus,
    rawBody: body,
  });

  await updatePaymentStatus({
    paymentId: paymentData.paymentId,
    status: normalizedStatus,
  });
};

module.exports = {
  handleClickWebhook,
};