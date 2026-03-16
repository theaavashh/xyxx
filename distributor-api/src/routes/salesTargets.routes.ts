import { Router } from 'express';
import { asyncHandler } from '@/middleware/error.middleware';
import { ApiResponse } from '@/types';
import { 
  getDistributors, 
  getProductCategories, 
  getProductsByCategory,
  getDistributorTargets,
  saveDistributorTargets,
  addDistributor
} from '@/controllers/salesTargets.controller';

const router = Router();

// Get all distributors for target assignment
router.get('/distributors', asyncHandler(getDistributors));

// Add new distributor
router.post('/distributors', asyncHandler(addDistributor));

// Get product categories for target assignment
router.get('/product-categories', asyncHandler(getProductCategories));

// Get products by category
router.get('/products/:categoryId', asyncHandler(getProductsByCategory));

// Get distributor targets by category and period
router.get('/distributor-targets', asyncHandler(getDistributorTargets));

// Save distributor targets
router.post('/distributor-targets', asyncHandler(saveDistributorTargets));

export default router;





