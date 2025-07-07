import express from 'express';
import { createProduct, getAllProducts, getFeaturedProducts } from '../controllers/product.controller.js';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protectRoute, adminRoute, getAllProducts);
router.get('/featured', getFeaturedProduct);
router.post('/', createProduct);
// router.get('/featured', getFeaturedProducts);

export default router;

