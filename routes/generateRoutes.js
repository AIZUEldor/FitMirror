const express = require("express");
const router = express.Router();
const multer = require("multer");
const { generateTryOn } = require("../controllers/generateController");
const { protect } = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/generate:
 *   post:
 *     summary: Generate try-on image
 *     tags: [Generate]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               personImage:
 *                 type: string
 *                 format: binary
 *               clothImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Try-on generated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Try-on generated successfully
 *               data:
 *                 mode: mock-fallback
 *                 resultImage: generated_xxx.jpg
 *                 resultUrl: http://localhost:5000/generated/generated_xxx.jpg
 *                 note: Hozircha mock provider ishladi
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: personImage va clothImage majburiy
 *               error: {}
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 *               error: {}
 */
router.post(
  "/generate",
  protect,
  upload.fields([
  { name: "personImage", maxCount: 1 },
  { name: "clothImage", maxCount: 1 },
]),
  generateTryOn
);

module.exports = router;