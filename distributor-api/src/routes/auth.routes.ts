import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  updateUser
} from '@/controllers/auth.controller';
import { 
  LoginSchema, 
  RegisterSchema, 
  ChangePasswordSchema, 
  UpdateProfileSchema 
} from '@/schemas/auth.schema';
import { validate, sanitizeInput } from '@/middleware/validation.middleware';
import { authenticateToken, authorize } from '@/middleware/auth.middleware';
import { authLimiter, passwordResetLimiter } from '@/middleware/rate-limit.middleware';

const router = Router();

// Public routes
router.post('/register', 
  authLimiter,
  sanitizeInput,
  validate(RegisterSchema),
  register
);

router.post('/login', 
  authLimiter,
  sanitizeInput,
  validate(LoginSchema),
  login
);

router.post('/logout', logout);

// Protected routes
router.get('/profile', 
  authenticateToken,
  getProfile
);

router.put('/profile', 
  authenticateToken,
  sanitizeInput,
  validate(UpdateProfileSchema),
  updateProfile
);

router.post('/change-password', 
  authenticateToken,
  passwordResetLimiter,
  sanitizeInput,
  validate(ChangePasswordSchema),
  changePassword
);

router.post('/refresh-token', 
  authenticateToken,
  refreshToken
);

// Admin/Manager routes
router.get('/users', 
  authenticateToken,
  authorize('ADMIN', 'MANAGERIAL', 'SALES_MANAGER'),
  getAllUsers
);

router.put('/users/:userId/status', 
  authenticateToken,
  authorize('ADMIN', 'MANAGERIAL', 'SALES_MANAGER'),
  updateUserStatus
);

router.put('/users/:userId', 
  authenticateToken,
  authorize('ADMIN', 'MANAGERIAL', 'SALES_MANAGER'),
  updateUser
);

router.delete('/users/:userId', 
  authenticateToken,
  authorize('ADMIN', 'MANAGERIAL', 'SALES_MANAGER'),
  deleteUser
);

export default router;
