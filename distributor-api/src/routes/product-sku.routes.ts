import { Router } from 'express';
import {
  getAllSKUs,
  getSKUById,
  createSKU,
  updateSKU,
  deleteSKU,
  getSKUsByProduct
} from '@/controllers/product-sku.controller';
import { authenticateToken, authorize } from '@/middleware/auth.middleware';
import { applicationLimiter } from '@/middleware/rate-limit.middleware';

const router = Router();

// Development routes (bypass authentication in development)
if (process.env.NODE_ENV === 'development') {
  // Create SKU (development)
  router.post('/dev',
    applicationLimiter,
    createSKU
  );
}

// Public routes (read-only)
router.get('/', getAllSKUs);
router.get('/:id', getSKUById);

// Protected routes - Admin only
router.post('/',
  authenticateToken,
  authorize('ADMIN', 'MANAGERIAL'),
  applicationLimiter,
  createSKU
);

router.put('/:id',
  authenticateToken,
  authorize('ADMIN', 'MANAGERIAL'),
  applicationLimiter,
  updateSKU
);

router.delete('/:id',
  authenticateToken,
  authorize('ADMIN', 'MANAGERIAL'),
  applicationLimiter,
  deleteSKU
);

// Get SKUs by product (public)
router.get('/product/:productId', getSKUsByProduct);

export default router;