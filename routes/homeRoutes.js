const express = require("express");
const router = express.Router();
const { getHome } = require("../controllers/homeController");

/**
 * @swagger
 * /:
 *   get:
 *     summary: Home route
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Backend is running
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: FitMirror backend is running
 *               data:
 *                 app: FitMirror Backend
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 *               error: {}
 */
router.get("/", getHome);

module.exports = router;