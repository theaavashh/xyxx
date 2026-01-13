import { Router } from 'express';
import { 
  getPaymentConfigs, 
  getPaymentConfig, 
  createPaymentConfig, 
  updatePaymentConfig, 
  deletePaymentConfig 
} from '../controllers/payment-config.controller';

const router = Router();

// Routes for payment configurations
router.get('/', getPaymentConfigs);
router.get('/:id', getPaymentConfig);
router.post('/', createPaymentConfig);
router.put('/:id', updatePaymentConfig);
router.delete('/:id', deletePaymentConfig);

export default router;