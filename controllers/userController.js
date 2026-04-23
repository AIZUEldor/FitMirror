const prisma = require("../src/lib/prisma");
const userService = require("../services/userService");
const PAYMENT_PROVIDERS = require("../config/paymentProviders");
const clickConfig = require("../config/clickConfig");
const {
  getUserImages,
  deleteImageById
} = require("../services/imageDbService");
const {
  registerUser,
  loginUser,
  loginWithGoogle,
  getMe,
  upgradeUserPlan,
  buyUserCredits,
  getUserDevices,
  removeUserDevice,
  createPaymentRecord,
  updatePaymentStatus,
  getUserPayments
} = require("../services/userService");

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    const user = await userService.registerUser({
      email,
      password,
      fullName,
    });

    return res.status(201).json({
      success: true,
      message: "User muvaffaqiyatli ro'yxatdan o'tdi",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password, deviceId, deviceName } = req.body;

const user = await userService.loginUser({
  email,
  password,
  deviceId,
  deviceName,
});

    return res.status(200).json({
      success: true,
      message: "Login muvaffaqiyatli",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const { token, deviceId, deviceName } = req.body;

    const result = await loginWithGoogle({
      token,
      deviceId,
      deviceName,
    });

    return res.status(200).json({
      success: true,
      message: "Google login muvaffaqiyatli",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
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
      },
    });
    const deviceCount = await prisma.userDevice.count({
  where: {
    userId: req.user.userId,
  },
});

const remainingGenerations = Math.max(
  user.monthlyGenerationLimit - user.monthlyGenerationUsed,
  0
);

    return res.status(200).json({
      success: true,
      message: "User ma'lumotlari",
      data: {
  ...user,
  remainingGenerations,
  deviceCount,
  maxDevices: 3,
}
    });
  } catch (error) {
    next(error);
  }
};
exports.getMyImages = async (req, res, next) => {
  try {
    const images = await getUserImages(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "User rasmlari",
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

const { getUserSessions } = require("../services/imageDbService");

exports.getMySessions = async (req, res, next) => {
  try {
    const images = await getUserSessions(req.user.userId);

    const sessionsMap = {};

    for (const img of images) {
      if (!sessionsMap[img.sessionId]) {
        sessionsMap[img.sessionId] = {
          sessionId: img.sessionId,
          person: null,
          cloth: null,
          result: null,
        };
      }

      if (img.type === "person" && !sessionsMap[img.sessionId].person) {
  sessionsMap[img.sessionId].person = img;
}

if (img.type === "cloth" && !sessionsMap[img.sessionId].cloth) {
  sessionsMap[img.sessionId].cloth = img;
}

if (img.type === "result" && !sessionsMap[img.sessionId].result) {
  sessionsMap[img.sessionId].result = img;
}
    }

    const groupedSessions = Object.values(sessionsMap);

    return res.status(200).json({
      success: true,
      message: "User sessionlari",
      data: groupedSessions,
    });
  } catch (error) {
    next(error);
  }
};

exports.upgradePlan = async (req, res, next) => {
  try {
    const user = await upgradeUserPlan({
      userId: req.user.userId,
      plan: req.body.plan,
    });

    return res.status(200).json({
      success: true,
      message: "Tarif muvaffaqiyatli yangilandi",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.buyCredits = async (req, res, next) => {
  try {
    const user = await buyUserCredits({
      userId: req.user.userId,
      pack: req.body.pack,
    });

    return res.status(200).json({
      success: true,
      message: "Credit muvaffaqiyatli qo'shildi",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.createTestPayment = async (req, res, next) => {
  try {
    const { amount, status, planName } = req.body;

    const payment = await createPaymentRecord({
      userId: req.user.userId,
      provider: PAYMENT_PROVIDERS.CLICK,
      amount,
      status,
      planName,
    });

    return res.status(201).json({
      success: true,
      message: "Test payment yaratildi",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const payment = await updatePaymentStatus({
      paymentId: req.params.paymentId,
      status: req.body.status,
    });

    res.status(200).json({
      success: true,
      message: "Payment status yangilandi",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

exports.clickWebhook = async (req, res, next) => {
  try {
    console.log("CLICK WEBHOOK BODY:", req.body);

    const incomingSecret = req.headers["x-click-secret"];

    if (incomingSecret !== clickConfig.webhookSecret) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized webhook",
      });
    }

    const paymentId =
      req.body.payment_id ||
      req.body.paymentId ||
      req.body.merchant_trans_id;

    const paymentStatus =
      req.body.status ||
      req.body.payment_status ||
      req.body.status_note;

      let normalizedStatus = String(paymentStatus).toUpperCase();

if (
  normalizedStatus === "SUCCESS" ||
  normalizedStatus === "COMPLETED"
) {
  normalizedStatus = "PAID";
}

    if (!paymentId || !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "paymentId va status topilmadi",
      });
    }

    await updatePaymentStatus({
  paymentId,
  status: normalizedStatus,
});
    return res.status(200).json({
      success: true,
      message: "Click webhook qabul qilindi",
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await getUserPayments({
      userId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "User to'lovlari",
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDevices = async (req, res, next) => {
  try {
    const devices = await getUserDevices({
      userId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "User qurilmalari",
      data: devices,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDevice = async (req, res, next) => {
  try {
    const result = await removeUserDevice({
      userId: req.user.userId,
      deviceId: req.params.deviceId,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    await deleteImageById(
      req.params.imageId,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Rasm o‘chirildi"
    });
  } catch (error) {
    next(error);
  }
};