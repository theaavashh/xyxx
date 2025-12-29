import { Router } from 'express';
import {
  distributorLogin,
  distributorLogout,
  getDistributorProfile
} from '@/controllers/distributor-auth.controller';
import {
  LoginSchema
} from '@/schemas/auth.schema';
import { validate, sanitizeInput } from '@/middleware/validation.middleware';
import { authenticateToken } from '@/middleware/auth.middleware';
import { authLimiter } from '@/middleware/rate-limit.middleware';

const router = Router();

// Distributor-specific authentication routes
router.post('/login', 
  authLimiter,
  sanitizeInput,
  validate(LoginSchema),
  distributorLogin
);

router.post('/logout', 
  authenticateToken,
  distributorLogout
);

router.get('/profile', 
  authenticateToken,
  getDistributorProfile
);

export default router;