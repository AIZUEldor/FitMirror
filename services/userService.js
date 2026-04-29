const bcrypt = require("bcrypt");
const prisma = require("../src/lib/prisma");
const jwt = require("jsonwebtoken");
const { PLAN_LIMITS, CREDIT_PACKS } = require("../config/planLimits");
const { googleClient } = require("./googleAuthService");
const PAYMENT_STATUS = require("../config/paymentStatus");
const PAYMENT_PROVIDERS = require("../config/paymentProviders");
const PRICING_CONFIG = require("../config/pricingConfig");
const {
  createCheckoutPayment: createProviderCheckoutPayment,
} = require("./payments/paymentProviderService");

const registerUser = async ({ email, password, fullName }) => {
  if (!email || !password) {
    const error = new Error("Email va password majburiy");
    error.statusCode = 400;
    throw error;
  }
  
  email = email.trim().toLowerCase();
  fullName = fullName ? fullName.trim() : null;

  if (password.length < 6) {
    const error = new Error("Password kamida 6 ta belgidan iborat bo'lishi kerak");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });


  if (existingUser) {
    const error = new Error("Bu email allaqachon ro'yxatdan o'tgan");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    fullName,
    plan: "FREE",
    monthlyGenerationLimit: PLAN_LIMITS.FREE,
    monthlyGenerationUsed: 0,
    planStartedAt: new Date(),
    planExpiresAt: null,
  },
  select: {
    id: true,
    email: true,
    fullName: true,
    plan: true,
    monthlyGenerationLimit: true,
    monthlyGenerationUsed: true,
    planStartedAt: true,
    planExpiresAt: true,
    createdAt: true,
    updatedAt: true,
  },
});

  return user;
};

const loginUser = async ({ email, password, deviceId, deviceName }) => {
  if (!email || !password) {
    const error = new Error("Email va password majburiy");
    error.statusCode = 400;
    throw error;
  }

  if (!deviceId) {
    const error = new Error("deviceId majburiy");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error("Email yoki password noto'g'ri");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Email yoki password noto'g'ri");
    error.statusCode = 401;
    throw error;
  }

  const existingDevice = await prisma.userDevice.findUnique({
    where: {
      userId_deviceId: {
        userId: user.id,
        deviceId: deviceId,
      },
    },
  });

  if (!existingDevice) {
    const deviceCount = await prisma.userDevice.count({
      where: { userId: user.id },
    });

    if (deviceCount >= 3) {
      const error = new Error("Maksimum 3 ta qurilmada foydalanish mumkin");
      error.statusCode = 403;
      throw error;
    }

    await prisma.userDevice.create({
      data: {
        userId: user.id,
        deviceId: deviceId,
        deviceName: deviceName || null,
      },
    });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    token,
  };
};

const loginWithGoogle = async ({ token, deviceId, deviceName }) => {
  if (!token) {
    const error = new Error("Google token majburiy");
    error.statusCode = 400;
    throw error;
  }

  if (!deviceId) {
    const error = new Error("deviceId majburiy");
    error.statusCode = 400;
    throw error;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    const error = new Error("Google payload topilmadi");
    error.statusCode = 401;
    throw error;
  }

  if (!payload.email) {
    const error = new Error("Google account email topilmadi");
    error.statusCode = 401;
    throw error;
  }

  if (!payload.email_verified) {
    const error = new Error("Google email tasdiqlanmagan");
    error.statusCode = 401;
    throw error;
  }

  const email = payload.email.trim().toLowerCase();
  const fullName = payload.name ? payload.name.trim() : null;
  const profilePicture = payload.picture || null;
  const googleId = payload.sub;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  let user = existingUser;

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: "GOOGLE_AUTH",
        googleId,
        authProvider: "GOOGLE",
        profilePicture,
        fullName,
        plan: "FREE",
        monthlyGenerationLimit: 2,
        monthlyGenerationUsed: 0,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: user.googleId || googleId,
        authProvider: "GOOGLE",
        profilePicture: user.profilePicture || profilePicture,
        fullName: user.fullName || fullName,
      },
    });
  }

  const existingDevice = await prisma.userDevice.findUnique({
    where: {
      userId_deviceId: {
        userId: user.id,
        deviceId: deviceId,
      },
    },
  });

  if (!existingDevice) {
    const deviceCount = await prisma.userDevice.count({
      where: { userId: user.id },
    });

    if (deviceCount >= 3) {
      const error = new Error("Maksimum 3 ta qurilmada foydalanish mumkin");
      error.statusCode = 403;
      throw error;
    }

    await prisma.userDevice.create({
      data: {
        userId: user.id,
        deviceId: deviceId,
        deviceName: deviceName || null,
      },
    });
  }

  const jwtToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
    },
    token: jwtToken,
  };
};

const upgradeUserPlan = async ({ userId, plan }) => {
  const allowedPlans = Object.keys(PLAN_LIMITS);

  if (!allowedPlans.includes(plan)) {
    const error = new Error("Noto'g'ri tarif tanlandi");
    error.statusCode = 400;
    throw error;
  }

  if (plan === "FREE") {
    const error = new Error("FREE plan'ga upgrade qilib bo'lmaydi");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30);

  const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: {
    plan,
    monthlyGenerationLimit: PLAN_LIMITS[plan],
    monthlyGenerationUsed: 0,
    planStartedAt: now,
    planExpiresAt: expiresAt,
  },
  select: {
    id: true,
    email: true,
    fullName: true,
    plan: true,
    monthlyGenerationLimit: true,
    monthlyGenerationUsed: true,
    planStartedAt: true,
    planExpiresAt: true,
    createdAt: true,
    updatedAt: true,
  },
});

  return updatedUser;
};

const buyUserCredits = async ({ userId, pack }) => {
  const allowedPacks = Object.keys(CREDIT_PACKS);

  if (!allowedPacks.includes(pack)) {
    const error = new Error("Noto'g'ri credit pack tanlandi");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error("User topilmadi");
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyGenerationLimit: user.monthlyGenerationLimit + CREDIT_PACKS[pack],
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      plan: true,
      monthlyGenerationLimit: true,
      monthlyGenerationUsed: true,
      planStartedAt: true,
      planExpiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const createPaymentRecord = async ({
  userId,
  provider,
  amount,
  currency = "UZS",
  status = PAYMENT_STATUS.PENDING,
  planName = null,
}) => {
  if (!userId) {
    const error = new Error("userId majburiy");
    error.statusCode = 400;
    throw error;
  }

  if (!provider) {
    const error = new Error("provider majburiy");
    error.statusCode = 400;
    throw error;
  }

  if (amount === undefined || amount === null) {
    const error = new Error("amount majburiy");
    error.statusCode = 400;
    throw error;
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      provider,
      amount,
      currency,
      status , 
      planName,
    },
  });

  return payment;
};

const createCheckoutPayment = async ({ userId, provider, planName, packName }) => {
  if (!userId) {
    const error = new Error("userId majburiy");
    error.statusCode = 400;
    throw error;
  }

  if (!provider) {
    const error = new Error("provider majburiy");
    error.statusCode = 400;
    throw error;
  }

  let selectedItem = null;
  let finalPlanName = null;

  if (planName) {
    selectedItem = PRICING_CONFIG.SUBSCRIPTIONS[planName.toUpperCase()];
    finalPlanName = planName.toUpperCase();
  }

  if (packName) {
    selectedItem = PRICING_CONFIG.CREDITS[packName.toUpperCase()];
    finalPlanName = packName.toUpperCase();
  }

  if (!selectedItem) {
    const error = new Error("Noto'g'ri plan yoki credit pack tanlandi");
    error.statusCode = 400;
    throw error;
  }

  const payment = await createPaymentRecord({
    userId,
    provider: provider.toUpperCase(),
    amount: selectedItem.price,
    currency: "USD",
    planName: finalPlanName,
  });

 const checkout = await createProviderCheckoutPayment({
  provider: provider.toUpperCase(),
  payment,
  itemName: finalPlanName,
});

return {
  payment: {
    id: payment.id,
    provider: payment.provider,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    planName: payment.planName,
  },
  checkout: {
    provider: checkout.provider,
    checkoutUrl: checkout.checkoutUrl,
    paymentId: payment.id,
    expiresIn: 900,
  },
};
};

const updatePaymentStatus = async ({ paymentId, status }) => {
  if (!paymentId) {
    const error = new Error("paymentId majburiy");
    error.statusCode = 400;
    throw error;
  }

  if (!status) {
    const error = new Error("status majburiy");
    error.statusCode = 400;
    throw error;
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!existingPayment) {
    const error = new Error("Payment topilmadi");
    error.statusCode = 404;
    throw error;
  }

  if (
  existingPayment.status === PAYMENT_STATUS.PAID &&
  status === PAYMENT_STATUS.PAID
  ) {
  return existingPayment;
  }

  if (status === PAYMENT_STATUS.PAID && existingPayment.planName) {
    const selectedPlan = existingPayment.planName.toUpperCase();

    const planLimits = {
      FREE: 2,
      PLUS: 10,
      PRO: 20,
      PRIME: 40,
    };

    const monthlyGenerationLimit = planLimits[selectedPlan];

    if (monthlyGenerationLimit) {
      await prisma.user.update({
        where: { id: existingPayment.userId },
        data: {
          plan: selectedPlan,
          monthlyGenerationLimit,
          monthlyGenerationUsed: 0,
          planStartedAt: new Date(),
          planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status },
  });

  return updatedPayment;
};

const createWebhookLog = async ({
  provider,
  paymentId = null,
  status = null,
  rawBody,
}) => {
  const webhookLog = await prisma.paymentWebhookLog.create({
    data: {
      provider,
      paymentId,
      status,
      rawBody,
    },
  });

  return webhookLog;
};

const getUserPayments = async ({ userId }) => {
  if (!userId) {
    const error = new Error("userId majburiy");
    error.statusCode = 400;
    throw error;
  }

  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

const getUserDevices = async ({ userId }) => {
  const devices = await prisma.userDevice.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      deviceId: true,
      deviceName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return devices;
};

const removeUserDevice = async ({ userId, deviceId }) => {
  const device = await prisma.userDevice.findFirst({
    where: {
      userId: userId,
      deviceId: deviceId,
    },
  });

  if (!device) {
    const error = new Error("Qurilma topilmadi");
    error.statusCode = 404;
    throw error;
  }

  await prisma.userDevice.delete({
    where: {
      id: device.id,
    },
  });

  return {
    message: "Qurilma muvaffaqiyatli o'chirildi",
  };
};

module.exports = {
  registerUser,
  loginUser,
  loginWithGoogle,
  upgradeUserPlan,
  buyUserCredits,
  getUserDevices,
  removeUserDevice,
  createPaymentRecord,
  updatePaymentStatus,
  createWebhookLog,
  createCheckoutPayment,
  getUserPayments
};