const bcrypt = require("bcrypt");
const prisma = require("../src/lib/prisma");
const jwt = require("jsonwebtoken");
const { PLAN_LIMITS, CREDIT_PACKS } = require("../config/planLimits");

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
    where: {
      userId: user.id,
    },
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
  upgradeUserPlan,
  buyUserCredits,
  getUserDevices,
  removeUserDevice
};