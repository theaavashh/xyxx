"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_controller_1 = require("@/controllers/categories.controller");
const categories_schema_1 = require("@/schemas/categories.schema");
const validation_middleware_1 = require("@/middleware/validation.middleware");
const auth_middleware_1 = require("@/middleware/auth.middleware");
const rate_limit_middleware_1 = require("@/middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
if (process.env.NODE_ENV === 'development') {
    router.post('/dev', rate_limit_middleware_1.applicationLimiter, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(categories_schema_1.CreateCategorySchema), categories_controller_1.createCategory);
    router.put('/dev/:id', rate_limit_middleware_1.applicationLimiter, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(categories_schema_1.UpdateCategorySchema), categories_controller_1.updateCategory);
    router.delete('/dev/:id', rate_limit_middleware_1.applicationLimiter, categories_controller_1.deleteCategory);
    router.patch('/dev/reorder', rate_limit_middleware_1.applicationLimiter, validation_middleware_1.sanitizeInput, categories_controller_1.reorderCategories);
}
router.get('/', categories_controller_1.getCategories);
router.get('/stats', categories_controller_1.getCategoryStats);
router.get('/:id', categories_controller_1.getCategoryById);
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), rate_limit_middleware_1.applicationLimiter, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(categories_schema_1.CreateCategorySchema), categories_controller_1.createCategory);
router.put('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), rate_limit_middleware_1.applicationLimiter, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(categories_schema_1.UpdateCategorySchema), categories_controller_1.updateCategory);
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), rate_limit_middleware_1.applicationLimiter, categories_controller_1.deleteCategory);
router.patch('/reorder', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), rate_limit_middleware_1.applicationLimiter, validation_middleware_1.sanitizeInput, categories_controller_1.reorderCategories);
exports.default = router;
//# sourceMappingURL=categories.routes.js.map