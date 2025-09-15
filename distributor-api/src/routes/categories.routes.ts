import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getCategoryStats
} from '@/controllers/categories.controller';
import { 
  CreateCategorySchema, 
  UpdateCategorySchema,
  GetCategoriesQuerySchema,
  CategoryIdParamSchema
} from '@/schemas/categories.schema';
import { validate, sanitizeInput } from '@/middleware/validation.middleware';
import { authenticateToken, authorize } from '@/middleware/auth.middleware';
import { applicationLimiter } from '@/middleware/rate-limit.middleware';

const router = Router();

// Development routes (bypass authentication in development)
if (process.env.NODE_ENV === 'development') {
  // Create category (development)
  router.post('/dev', 
    applicationLimiter,
    sanitizeInput,
    validate(CreateCategorySchema),
    createCategory
  );

  // Update category (development)
  router.put('/dev/:id',
    applicationLimiter,
    sanitizeInput,
    validate(UpdateCategorySchema),
    updateCategory
  );

  // Delete category (development)
  router.delete('/dev/:id',
    applicationLimiter,
    deleteCategory
  );

  // Reorder categories (development)
  router.patch('/dev/reorder',
    applicationLimiter,
    sanitizeInput,
    reorderCategories
  );
}

// Public routes (read-only)
router.get('/', 
  getCategories
);

router.get('/stats',
  getCategoryStats
);

router.get('/:id', 
  getCategoryById
);

// Protected routes - Admin/Sales Manager only
router.post('/', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  applicationLimiter,
  sanitizeInput,
  validate(CreateCategorySchema),
  createCategory
);

router.put('/:id', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  applicationLimiter,
  sanitizeInput,
  validate(UpdateCategorySchema),
  updateCategory
);

router.delete('/:id', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  applicationLimiter,
  deleteCategory
);

router.patch('/reorder', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  applicationLimiter,
  sanitizeInput,
  reorderCategories
);

export default router;
