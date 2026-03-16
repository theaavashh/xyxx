"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_sku_controller_1 = require("../controllers/product-sku.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
if (process.env.NODE_ENV === 'development') {
    router.post('/dev', rate_limit_middleware_1.applicationLimiter, product_sku_controller_1.createSKU);
}
router.get('/', product_sku_controller_1.getAllSKUs);
router.get('/:id', product_sku_controller_1.getSKUById);
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'MANAGERIAL'), rate_limit_middleware_1.applicationLimiter, product_sku_controller_1.createSKU);
router.put('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'MANAGERIAL'), rate_limit_middleware_1.applicationLimiter, product_sku_controller_1.updateSKU);
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'MANAGERIAL'), rate_limit_middleware_1.applicationLimiter, product_sku_controller_1.deleteSKU);
router.get('/product/:productId', product_sku_controller_1.getSKUsByProduct);
exports.default = router;
//# sourceMappingURL=product-sku.routes.js.map