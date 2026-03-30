const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { generateTryOn } = require("../controllers/generateController");

router.post(
  "/generate",
  upload.fields([
    { name: "personImage", maxCount: 1 },
    { name: "clothImage", maxCount: 1 }
  ]),
  generateTryOn
);

module.exports = router;
