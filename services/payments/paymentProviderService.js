const { handleClickWebhook } = require("./clickPaymentService");
const { handlePaymeWebhook } = require("./paymePaymentService");

const PAYMENT_PROVIDERS = {
  CLICK: "CLICK",
  PAYME: "PAYME",
};

const handlePaymentWebhook = async ({ provider, headers, body }) => {
  switch (provider) {
    case PAYMENT_PROVIDERS.CLICK:
      return await handleClickWebhook({ headers, body });

    case PAYMENT_PROVIDERS.PAYME:
      return await handlePaymeWebhook({ body });

    default: {
      const error = new Error("Noma'lum payment provider");
      error.statusCode = 400;
      throw error;
    }
  }
};

module.exports = {
  PAYMENT_PROVIDERS,
  handlePaymentWebhook,
};