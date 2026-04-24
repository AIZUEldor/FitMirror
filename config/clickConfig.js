module.exports = {
  merchantId: process.env.CLICK_MERCHANT_ID,
  serviceId: process.env.CLICK_SERVICE_ID,
  merchantUserId: process.env.CLICK_MERCHANT_USER_ID,
  secretKey: process.env.CLICK_SECRET_KEY,
  webhookSecret: process.env.CLICK_WEBHOOK_SECRET,

  checkoutBaseUrl:
    process.env.CLICK_CHECKOUT_URL ||
    "https://my.click.uz/services/pay",
};