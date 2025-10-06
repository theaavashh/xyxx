import { Router } from 'express';
import { 
  submitOrder, 
  getAllOrders, 
  getDistributorOrders, 
  updateOrderStatus, 
  getOrderDetails 
} from '@/controllers/order.controller';
import { authenticateToken, authorize } from '@/middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required for now)
// In production, you might want to add authentication

// Distributor routes (authenticated)
router.post('/submit', authenticateToken, submitOrder);
router.get('/my-orders', authenticateToken, getDistributorOrders);

// Admin routes (authenticated + authorized)
router.get('/', authenticateToken, authorize('ADMIN', 'SALES_MANAGER', 'MANAGERIAL'), getAllOrders);
router.get('/:id', authenticateToken, authorize('ADMIN', 'SALES_MANAGER', 'MANAGERIAL'), getOrderDetails);
router.patch('/:id/status', authenticateToken, authorize('ADMIN', 'SALES_MANAGER', 'MANAGERIAL'), updateOrderStatus);

export default router;
