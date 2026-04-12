const prisma = require("../src/lib/prisma");
const userService = require("../services/userService");
const { getUserImages } = require("../services/imageDbService");

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
    const { email, password } = req.body;

    const user = await userService.loginUser({
      email,
      password,
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
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User ma'lumotlari",
      data: user,
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