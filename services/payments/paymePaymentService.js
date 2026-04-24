const { createWebhookLog } = require("../paymentWebhookLogService");
const { updatePaymentStatus } = require("../userService");

const PAYME_PROVIDER = "PAYME";

const normalizePaymeStatus = (paymentStatus) => {
  const normalizedStatus = String(paymentStatus).toUpperCase();

  if (
    normalizedStatus === "SUCCESS" ||
    normalizedStatus === "COMPLETED" ||
    normalizedStatus === "PAID"
  ) {
    return "PAID";
  }

  return normalizedStatus;
};

const extractPaymePaymentData = (body) => {
  return {
    paymentId:
      body.payment_id ||
      body.paymentId ||
      body.transaction_id ||
      body.order_id,

    paymentStatus:
      body.status ||
      body.payment_status ||
      body.state,
  };
};

const validatePaymePaymentData = ({ paymentId, paymentStatus }) => {
  if (!paymentId || !paymentStatus) {
    const error = new Error("paymentId va status topilmadi");
    error.statusCode = 400;
    throw error;
  }
};

const handlePaymeWebhook = async ({ body }) => {
  const paymentData = extractPaymePaymentData(body);

  validatePaymePaymentData(paymentData);

  const normalizedStatus = normalizePaymeStatus(paymentData.paymentStatus);

  await createWebhookLog({
    provider: PAYME_PROVIDER,
    paymentId: paymentData.paymentId,
    status: normalizedStatus,
    rawBody: body,
  });

  await updatePaymentStatus({
    paymentId: paymentData.paymentId,
    status: normalizedStatus,
  });
};

const createPaymeCheckout = async ({ payment }) => {
  const checkoutUrl =
    `https://checkout.paycom.uz/` +
    `?id=${payment.id}` +
    `&amount=${payment.amount}`;

  return {
    provider: PAYME_PROVIDER,
    checkoutUrl,
  };
};

module.exports = {
  handlePaymeWebhook,
  createPaymeCheckout,
};