const express = require("express");
const router = express.Router();
const { getHealth } = require("../controllers/healthController");
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: API is healthy
 *               data:
 *                 status: OK
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 *               error: {}
 */
router.get("/health", getHealth);

module.exports = router;