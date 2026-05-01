require("dotenv").config();
console.log("DATABASE_URL =", process.env.DATABASE_URL);
console.log("NODE_ENV =", process.env.NODE_ENV);
const userRoutes = require("./routes/userRoutes");
const express = require("express");
const cors = require("cors");
const homeRoutes = require("./routes/homeRoutes");
const healthRoutes = require("./routes/healthRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const generateRoutes = require("./routes/generateRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cron = require("node-cron");
const { resetMonthlyPlans } = require("./services/planResetService");
//const { runCleanup } = require("./services/fileCleanupService");
const provider = "replicate";
const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");
const adRoutes = require("./src/modules/ads/adRoutes");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
    error: {}
  }
});
app.use(morgan("dev"));
app.use(helmet());
app.use(limiter);
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/", homeRoutes);
app.use("/api", healthRoutes);
app.use("/api", uploadRoutes);
app.use("/api", generateRoutes);
app.use("/api/ads", adRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/generated", express.static("generated"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

cron.schedule("0 0 * * *", async () => {
  try {
    const result = await resetMonthlyPlans();
    console.log("Monthly plan reset bajarildi:", result);
  } catch (error) {
    console.error("Monthly plan reset xatolik:", error.message);
  }
});
//cron.schedule("*/10 * * * *", () => {
 // console.log("Running cleanup (cron)...");
 // runCleanup();
//});