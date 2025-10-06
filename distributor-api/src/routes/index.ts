import { Router } from 'express';
import authRoutes from './auth.routes';
import distributorRoutes from './distributor.routes';
import distributorsRoutes from './distributors.routes';
import categoriesRoutes from './categories.routes';
import productsRoutes from './products.routes';
import orderRoutes from './order.routes';
import accountingRoutes from './accounting.routes';
import accountingComprehensiveRoutes from './accounting-comprehensive.routes';
import productionRoutes from './production.routes';
import salesRoutes from './sales';
import { testEmail, testEmailWithoutCredentials } from '../controllers/test.controller';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/applications', distributorRoutes);
router.use('/distributors', distributorsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/products', productsRoutes);
router.use('/orders', orderRoutes);
router.use('/accounting', accountingRoutes);
router.use('/accounting', accountingComprehensiveRoutes);
router.use('/production', productionRoutes);
router.use('/sales', salesRoutes);

// Test email endpoints (development only)
if (process.env.NODE_ENV === 'development') {
  router.post('/test/email', testEmail);
  router.post('/test/email-without-credentials', testEmailWithoutCredentials);
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API स्वस्थ छ',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'वितरक आवेदन API',
    data: {
      name: 'Distributor Application API',
      version: '1.0.0',
      description: 'TypeScript backend API for distributor application management',
      endpoints: {
        auth: '/api/auth',
        applications: '/api/applications',
        distributors: '/api/distributors',
        categories: '/api/categories',
        products: '/api/products',
        orders: '/api/orders',
        accounting: '/api/accounting',
        production: '/api/production',
        health: '/api/health'
      }
    }
  });
});

export default router;
