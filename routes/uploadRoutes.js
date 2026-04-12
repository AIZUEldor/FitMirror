const express = require("express");
const router = express.Router();

const upload = require("../config/multer"); // ✅ mana bu eng muhim
const { uploadImage } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");
/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload image
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: File uploaded and optimized successfully
 *               data:
 *                 fileName: 1775240874211-optimized.jpg
 *                 fileUrl: http://localhost:5000/uploads/1775240874211-optimized.jpg
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unexpected field name
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

router.post("/upload", protect, upload.single("image"), uploadImage);


module.exports = router;