import express from 'express';
import {
  getCurrentSales,
  getAllCurrentSales,
  addCurrentSalesEntry,
  getCurrentSalesDashboard
} from '../controllers/currentSalesController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Get current sales for a specific distributor
router.get('/distributors/:distributorId', authenticateToken, getCurrentSales);

// Get current sales dashboard data for a distributor
router.get('/distributors/:distributorId/dashboard', authenticateToken, getCurrentSalesDashboard);

// Add/update current sales entry
router.post('/distributors/:distributorId/entries', authenticateToken, addCurrentSalesEntry);

// Get all current sales (admin view)
router.get('/all', authenticateToken, getAllCurrentSales);

export default router;