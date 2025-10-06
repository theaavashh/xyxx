"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const distributor_controller_1 = require("@/controllers/distributor.controller");
const distributor_schema_1 = require("@/schemas/distributor.schema");
const validation_middleware_1 = require("@/middleware/validation.middleware");
const auth_middleware_1 = require("@/middleware/auth.middleware");
const upload_middleware_1 = require("@/middleware/upload.middleware");
const rate_limit_middleware_1 = require("@/middleware/rate-limit.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const GetApplicationsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 10),
    sortBy: zod_1.z.string().optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    status: zod_1.z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_CHANGES']).optional(),
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    reviewedBy: zod_1.z.string().optional()
});
const ApplicationIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'आवेदन ID आवश्यक छ')
});
router.post('/submit', rate_limit_middleware_1.applicationLimiter, rate_limit_middleware_1.uploadLimiter, upload_middleware_1.uploadDocuments, distributor_controller_1.submitApplication);
if (process.env.NODE_ENV === 'development') {
    router.get('/dev', distributor_controller_1.getApplications);
    router.get('/dev/stats', distributor_controller_1.getApplicationStats);
    router.get('/dev/:id', distributor_controller_1.getApplicationById);
    router.put('/dev/:id/status', validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(distributor_schema_1.ApplicationUpdateDevSchema), distributor_controller_1.updateApplicationStatusDev);
    router.delete('/dev/:id', distributor_controller_1.deleteApplication);
}
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'), distributor_controller_1.getApplications);
router.get('/stats', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), distributor_controller_1.getApplicationStats);
router.get('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'), auth_middleware_1.canAccessApplication, distributor_controller_1.getApplicationById);
router.put('/:id/status', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER', 'SALES_REPRESENTATIVE'), auth_middleware_1.canAccessApplication, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(distributor_schema_1.ApplicationUpdateSchema), distributor_controller_1.updateApplicationStatus);
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), auth_middleware_1.canAccessApplication, distributor_controller_1.deleteApplication);
router.post('/send-offer-letter', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER'), distributor_controller_1.sendOfferLetter);
exports.default = router;
//# sourceMappingURL=distributor.routes.js.map