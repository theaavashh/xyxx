"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const distributor_routes_1 = __importDefault(require("./distributor.routes"));
const distributors_routes_1 = __importDefault(require("./distributors.routes"));
const categories_routes_1 = __importDefault(require("./categories.routes"));
const products_routes_1 = __importDefault(require("./products.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const accounting_routes_1 = __importDefault(require("./accounting.routes"));
const accounting_comprehensive_routes_1 = __importDefault(require("./accounting-comprehensive.routes"));
const production_routes_1 = __importDefault(require("./production.routes"));
const sales_1 = __importDefault(require("./sales"));
const test_controller_1 = require("../controllers/test.controller");
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/applications', distributor_routes_1.default);
router.use('/distributors', distributors_routes_1.default);
router.use('/categories', categories_routes_1.default);
router.use('/products', products_routes_1.default);
router.use('/orders', order_routes_1.default);
router.use('/accounting', accounting_routes_1.default);
router.use('/accounting', accounting_comprehensive_routes_1.default);
router.use('/production', production_routes_1.default);
router.use('/sales', sales_1.default);
if (process.env.NODE_ENV === 'development') {
    router.post('/test/email', test_controller_1.testEmail);
    router.post('/test/email-without-credentials', test_controller_1.testEmailWithoutCredentials);
}
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
exports.default = router;
//# sourceMappingURL=index.js.map