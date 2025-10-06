import { Router } from 'express';
import {
  createDistributor,
  getDistributors,
  getDistributorById,
  updateDistributor,
  deleteDistributor,
  getDistributorCredentials,
  saveDistributorCredentials,
  deleteDistributorCredentials,
  findDistributorByApplication,
  deactivateDistributor,
  activateDistributor
} from '@/controllers/distributors.controller';
import { CreateDistributorSchema, UpdateDistributorSchema } from '@/schemas/distributors.schema';
import { validate, sanitizeInput } from '@/middleware/validation.middleware';
import { authenticateToken, authorize } from '@/middleware/auth.middleware';
import { uploadDocuments } from '@/middleware/upload.middleware';
import { applicationLimiter } from '@/middleware/rate-limit.middleware';
import { z } from 'zod';

const router = Router();

// Query parameter schemas
const GetDistributorsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  search: z.string().optional()
});

const DistributorIdParamSchema = z.object({
  id: z.string().min(1, 'Distributor ID required')
});

// Development route - bypasses authentication for testing
if (process.env.NODE_ENV === 'development') {
  router.post('/dev', 
    applicationLimiter,
    uploadDocuments,
    sanitizeInput,
    validate(CreateDistributorSchema),
    createDistributor
  );
  
  // Development credential routes
  router.get('/:id/credentials', getDistributorCredentials);
  router.post('/:id/credentials', saveDistributorCredentials);
  router.delete('/:id/credentials', deleteDistributorCredentials);
  
  // Development route to find distributor by application
  router.get('/find-by-application/:applicationId', findDistributorByApplication);
  
  // Development route to deactivate distributor
  router.patch('/:id/deactivate', deactivateDistributor);
  
  // Development route to activate distributor
  router.patch('/:id/activate', activateDistributor);
}

// Protected routes - Admin/Sales Manager only
router.post('/', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  applicationLimiter,
  uploadDocuments,
  sanitizeInput,
  validate(CreateDistributorSchema),
  createDistributor
);

router.get('/', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'),
  getDistributors
);

router.get('/:id', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'),
  getDistributorById
);

router.put('/:id', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  uploadDocuments,
  sanitizeInput,
  validate(UpdateDistributorSchema),
  updateDistributor
);

router.delete('/:id', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  deleteDistributor
);

// Credential management routes
router.get('/:id/credentials', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  getDistributorCredentials
);

router.post('/:id/credentials', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  saveDistributorCredentials
);

router.delete('/:id/credentials', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  deleteDistributorCredentials
);

// Find distributor by application
router.get('/find-by-application/:applicationId', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'),
  findDistributorByApplication
);

// Activate/Deactivate distributor routes
router.patch('/:id/activate', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  activateDistributor
);

router.patch('/:id/deactivate', 
  authenticateToken,
  authorize('ADMIN', 'SALES_MANAGER'),
  deactivateDistributor
);

export default router;
