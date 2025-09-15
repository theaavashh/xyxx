"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const distributors_controller_1 = require("@/controllers/distributors.controller");
const distributors_schema_1 = require("@/schemas/distributors.schema");
const validation_middleware_1 = require("@/middleware/validation.middleware");
const auth_middleware_1 = require("@/middleware/auth.middleware");
const upload_middleware_1 = require("@/middleware/upload.middleware");
const rate_limit_middleware_1 = require("@/middleware/rate-limit.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const GetDistributorsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 10),
    sortBy: zod_1.z.string().optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    search: zod_1.z.string().optional()
});
const DistributorIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Distributor ID required')
});
if (process.env.NODE_ENV === 'development') {
    router.post('/dev', rate_limit_middleware_1.applicationLimiter, upload_middleware_1.uploadDocuments, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(distributors_schema_1.CreateDistributorSchema), distributors_controller_1.createDistributor);
    router.get('/:id/credentials', distributors_controller_1.getDistributorCredentials);
    router.post('/:id/credentials', distributors_controller_1.saveDistributorCredentials);
    router.delete('/:id/credentials', distributors_controller_1.deleteDistributorCredentials);
    router.get('/find-by-application/:applicationId', distributors_controller_1.findDistributorByApplication);
    router.patch('/:id/deactivate', distributors_controller_1.deactivateDistributor);
    router.patch('/:id/activate', distributors_controller_1.activateDistributor);
}
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), rate_limit_middleware_1.applicationLimiter, upload_middleware_1.uploadDocuments, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(distributors_schema_1.CreateDistributorSchema), distributors_controller_1.createDistributor);
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'), distributors_controller_1.getDistributors);
router.get('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'), distributors_controller_1.getDistributorById);
router.put('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), upload_middleware_1.uploadDocuments, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(distributors_schema_1.UpdateDistributorSchema), distributors_controller_1.updateDistributor);
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), distributors_controller_1.deleteDistributor);
router.get('/:id/credentials', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), distributors_controller_1.getDistributorCredentials);
router.post('/:id/credentials', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), distributors_controller_1.saveDistributorCredentials);
router.delete('/:id/credentials', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), distributors_controller_1.deleteDistributorCredentials);
exports.default = router;
//# sourceMappingURL=distributors.routes.js.map