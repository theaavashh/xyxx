import { Router } from 'express';
import {
  submitApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  updateApplicationStatusDev,
  deleteApplication,
  getApplicationStats
} from '@/controllers/distributor.controller';
import { DistributorApplicationSchema, ApplicationUpdateSchema, ApplicationUpdateDevSchema } from '@/schemas/distributor.schema';
import { validate, sanitizeInput } from '@/middleware/validation.middleware';
import { authenticateToken, authorize, canAccessApplication } from '@/middleware/auth.middleware';
import { uploadDocuments } from '@/middleware/upload.middleware';
import { applicationLimiter, uploadLimiter } from '@/middleware/rate-limit.middleware';
import { z } from 'zod';

const router = Router();

// Query parameter schemas
const GetApplicationsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_CHANGES']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  reviewedBy: z.string().optional()
});

const ApplicationIdParamSchema = z.object({
  id: z.string().min(1, 'आवेदन ID आवश्यक छ')
});

// Public routes
router.post('/submit', 
  applicationLimiter,
  uploadLimiter,
  uploadDocuments,
  submitApplication
);

// Development routes - bypass authentication for testing
if (process.env.NODE_ENV === 'development') {
  router.get('/dev', getApplications);
  router.get('/dev/stats', getApplicationStats);
  router.get('/dev/:id', getApplicationById);
  router.put('/dev/:id/status', 
    sanitizeInput,
    validate(ApplicationUpdateDevSchema),
    updateApplicationStatusDev
  );
  router.delete('/dev/:id', deleteApplication);
}

// Protected routes - Sales team only
router.get('/', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'),
  getApplications
);

router.get('/stats', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  getApplicationStats
);

router.get('/:id', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'),
  canAccessApplication,
  getApplicationById
);

router.put('/:id/status', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'),
  canAccessApplication,
  sanitizeInput,
  validate(ApplicationUpdateSchema),
  updateApplicationStatus
);

router.delete('/:id', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  canAccessApplication,
  deleteApplication
);

export default router;
