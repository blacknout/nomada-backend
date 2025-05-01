import express from "express";
import {
  getBikeMetadata,
  getBikeMakes,
  getBikeTypes,
  getBikeYears,
  getBikeModelsByMake
} from "../controllers/bikeMetadataController";

const router = express.Router();

/**
 * @swagger
 * /api/bike-metadata:
 *   get:
 *     summary: Get all bike metadata (makes, types, models, and years)
 *     tags:
 *       - Bike Metadata
 *     responses:
 *       200:
 *         description: List of all bike metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   make:
 *                     type: string
 *                     example: Honda
 *                   types:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Sport", "Cruiser", "Touring"]
 *                   models:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["CBR", "Goldwing", "Africa Twin"]
 *                   years:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["2018", "2019", "2020"]
 *       500:
 *         description: Internal server error
 */
router.get("/", getBikeMetadata);

/**
 * @swagger
 * /api/bike-metadata/makes:
 *   get:
 *     summary: Get all bike makes/brands
 *     tags:
 *       - Bike Metadata
 *     responses:
 *       200:
 *         description: List of bike makes/brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 makes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Honda", "Yamaha", "Kawasaki"]
 *       500:
 *         description: Internal server error
 */
router.get("/makes", getBikeMakes);

/**
 * @swagger
 * /api/bike-metadata/types:
 *   get:
 *     summary: Get all bike types
 *     tags:
 *       - Bike Metadata
 *     responses:
 *       200:
 *         description: List of bike types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 types:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Sport", "Cruiser", "Touring"]
 *       500:
 *         description: Internal server error
 */
router.get("/types", getBikeTypes);

/**
 * @swagger
 * /api/bike-metadata/years:
 *   get:
 *     summary: Get all bike years
 *     tags:
 *       - Bike Metadata
 *     responses:
 *       200:
 *         description: List of bike years
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 years:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["2024", "2023", "2022"]
 *       500:
 *         description: Internal server error
 */
router.get("/years", getBikeYears);

/**
 * @swagger
 * /api/bike-metadata/makes/{make}/models:
 *   get:
 *     summary: Get all models for a specific bike make
 *     tags:
 *       - Bike Metadata
 *     parameters:
 *       - in: path
 *         name: make
 *         required: true
 *         description: The motorcycle make/brand
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of models for the specified make
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 models:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["CBR", "Goldwing", "Africa Twin"]
 *       404:
 *         description: Make not found
 *       500:
 *         description: Internal server error
 */
router.get("/makes/:make/models", getBikeModelsByMake);

export default router;
