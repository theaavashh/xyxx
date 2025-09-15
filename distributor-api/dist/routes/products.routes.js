"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("@/controllers/products.controller");
const products_schema_1 = require("@/schemas/products.schema");
const validation_middleware_1 = require("@/middleware/validation.middleware");
const auth_middleware_1 = require("@/middleware/auth.middleware");
const upload_middleware_1 = require("@/middleware/upload.middleware");
const rate_limit_middleware_1 = require("@/middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
if (process.env.NODE_ENV === 'development') {
    router.post('/dev', rate_limit_middleware_1.applicationLimiter, upload_middleware_1.uploadDocuments, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(products_schema_1.CreateProductSchema), products_controller_1.createProduct);
    router.put('/dev/:id', rate_limit_middleware_1.applicationLimiter, upload_middleware_1.uploadDocuments, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(products_schema_1.UpdateProductSchema), products_controller_1.updateProduct);
    router.patch('/dev/:id/stock', rate_limit_middleware_1.applicationLimiter, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(products_schema_1.UpdateStockSchema), products_controller_1.updateProductStock);
    router.delete('/dev/:id', rate_limit_middleware_1.applicationLimiter, products_controller_1.deleteProduct);
}
router.get('/', products_controller_1.getProducts);
router.get('/stats', products_controller_1.getProductStats);
router.get('/category/:categoryId', products_controller_1.getProductsByCategory);
router.get('/:id', products_controller_1.getProductById);
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), rate_limit_middleware_1.applicationLimiter, upload_middleware_1.uploadDocuments, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(products_schema_1.CreateProductSchema), products_controller_1.createProduct);
router.put('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), rate_limit_middleware_1.applicationLimiter, upload_middleware_1.uploadDocuments, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(products_schema_1.UpdateProductSchema), products_controller_1.updateProduct);
router.patch('/:id/stock', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'), rate_limit_middleware_1.applicationLimiter, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(products_schema_1.UpdateStockSchema), products_controller_1.updateProductStock);
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), rate_limit_middleware_1.applicationLimiter, products_controller_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=products.routes.js.map