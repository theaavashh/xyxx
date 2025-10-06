import express from 'express';
import { 
  getDistributors, 
  getDistributorSales, 
  saveDistributorSales, 
  getDistributorMonths 
} from '../controllers/salesController';

const router = express.Router();

// Get all distributors
router.get('/distributors', getDistributors);

// Get sales data for a specific distributor and month
router.get('/distributors/:distributorId/sales/:year/:month', getDistributorSales);

// Save sales data for a distributor
router.post('/distributors/:distributorId/sales', saveDistributorSales);

// Get available months for a distributor
router.get('/distributors/:distributorId/months', getDistributorMonths);

export default router;


