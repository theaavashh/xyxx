import { Router } from 'express';
import { getProducts, getProductById, getProductCategories } from '@/controllers/product.controller';

const router = Router();

// Public routes for products (no authentication required for viewing products)
router.get('/', getProducts);
router.get('/categories', getProductCategories);
router.get('/:id', getProductById);

export default router;







