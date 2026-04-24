const { handleClickWebhook, createClickCheckout } = require("./clickPaymentService");
const { handlePaymeWebhook, createPaymeCheckout } = require("./paymePaymentService");
const { handleStripeWebhook, createStripeCheckout } = require("./stripePaymentService");

const PAYMENT_PROVIDERS = {
  CLICK: "CLICK",
  PAYME: "PAYME",
  STRIPE: "STRIPE",
};

const createCheckoutPayment = async ({ provider, payment }) => {
  switch (provider) {
    case PAYMENT_PROVIDERS.CLICK:
      return await createClickCheckout({ payment });

    case PAYMENT_PROVIDERS.PAYME:
      return await createPaymeCheckout({ payment });

    case PAYMENT_PROVIDERS.STRIPE:
      return await createStripeCheckout({ payment });

    default: {
      const error = new Error("Noma'lum payment provider");
      error.statusCode = 400;
      throw error;
    }
  }
};

const handlePaymentWebhook = async ({ provider, headers, body }) => {
  switch (provider) {
    case PAYMENT_PROVIDERS.CLICK:
      return await handleClickWebhook({ headers, body });

    case PAYMENT_PROVIDERS.PAYME:
      return await handlePaymeWebhook({ body });

    case PAYMENT_PROVIDERS.STRIPE:
      return await handleStripeWebhook({ headers, body });

    default: {
      const error = new Error("Noma'lum payment provider");
      error.statusCode = 400;
      throw error;
    }
  }
};

module.exports = {
  PAYMENT_PROVIDERS,
  createCheckoutPayment,
  handlePaymentWebhook,
};