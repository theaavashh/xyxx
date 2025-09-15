import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getProductsByCategory,
  getProductStats
} from '@/controllers/products.controller';
import { 
  CreateProductSchema, 
  UpdateProductSchema,
  UpdateStockSchema,
  GetProductsQuerySchema,
  ProductIdParamSchema
} from '@/schemas/products.schema';
import { validate, sanitizeInput } from '@/middleware/validation.middleware';
import { authenticateToken, authorize } from '@/middleware/auth.middleware';
import { uploadDocuments } from '@/middleware/upload.middleware';
import { applicationLimiter } from '@/middleware/rate-limit.middleware';

const router = Router();

// Development routes (bypass authentication in development)
if (process.env.NODE_ENV === 'development') {
  // Create product (development)
  router.post('/dev', 
    applicationLimiter,
    uploadDocuments,
    sanitizeInput,
    validate(CreateProductSchema),
    createProduct
  );

  // Update product (development)
  router.put('/dev/:id',
    applicationLimiter,
    uploadDocuments,
    sanitizeInput,
    validate(UpdateProductSchema),
    updateProduct
  );

  // Update stock (development)
  router.patch('/dev/:id/stock',
    applicationLimiter,
    sanitizeInput,
    validate(UpdateStockSchema),
    updateProductStock
  );

  // Delete product (development)
  router.delete('/dev/:id',
    applicationLimiter,
    deleteProduct
  );
}

// Public routes (read-only)
router.get('/', 
  getProducts
);

router.get('/stats',
  getProductStats
);

router.get('/category/:categoryId',
  getProductsByCategory
);

router.get('/:id', 
  getProductById
);

// Protected routes - Admin/Sales Manager only
router.post('/', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  applicationLimiter,
  uploadDocuments,
  sanitizeInput,
  validate(CreateProductSchema),
  createProduct
);

router.put('/:id', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  applicationLimiter,
  uploadDocuments,
  sanitizeInput,
  validate(UpdateProductSchema),
  updateProduct
);

router.patch('/:id/stock', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'),
  applicationLimiter,
  sanitizeInput,
  validate(UpdateStockSchema),
  updateProductStock
);

router.delete('/:id', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  applicationLimiter,
  deleteProduct
);

export default router;
