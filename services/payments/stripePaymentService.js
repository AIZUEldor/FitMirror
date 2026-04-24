const Stripe = require("stripe");
const stripeConfig = require("../../config/stripeConfig");

const STRIPE_PROVIDER = "STRIPE";

const stripe = stripeConfig.secretKey
  ? new Stripe(stripeConfig.secretKey)
  : null;

const createStripeCheckoutSession = async ({ payment, itemName }) => {
  if (!stripe) {
    const error = new Error("Stripe secret key sozlanmagan");
    error.statusCode = 500;
    throw error;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: payment.currency.toLowerCase(),
          product_data: {
            name: itemName,
          },
          unit_amount: Math.round(Number(payment.amount) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      paymentId: payment.id,
      userId: payment.userId,
      planName: payment.planName || "",
      provider: STRIPE_PROVIDER,
    },
    success_url: stripeConfig.successUrl,
    cancel_url: stripeConfig.cancelUrl,
  });

  return session.url;
};

const handleStripeWebhook = async ({ body }) => {
  console.log("STRIPE WEBHOOK BODY:", body);

  return true;
};

module.exports = {
  createStripeCheckoutSession,
  handleStripeWebhook,
  STRIPE_PROVIDER,
};