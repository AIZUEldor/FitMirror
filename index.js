require("dotenv").config();
const express = require("express");
const homeRoutes = require("./routes/homeRoutes");
const healthRoutes = require("./routes/healthRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const generateRoutes = require("./routes/generateRoutes");

const app = express();

app.use(express.json());

app.use("/", homeRoutes);
app.use("/api", healthRoutes);
app.use("/api", uploadRoutes);
app.use("/api", generateRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/generated", express.static("generated"));

app.listen(5000, () => {
    console.log("Server running on port 5000");
});