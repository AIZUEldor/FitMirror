const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token topilmadi",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded);

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    console.log("AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Noto'g'ri yoki eskirgan token",
    });
  }
};

module.exports = {
  protect,
};