"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("@/controllers/order.controller");
const auth_middleware_1 = require("@/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/submit', auth_middleware_1.authenticateToken, order_controller_1.submitOrder);
router.get('/my-orders', auth_middleware_1.authenticateToken, order_controller_1.getDistributorOrders);
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER', 'MANAGERIAL'), order_controller_1.getAllOrders);
router.get('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER', 'MANAGERIAL'), order_controller_1.getOrderDetails);
router.patch('/:id/status', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)('ADMIN', 'SALES_MANAGER', 'MANAGERIAL'), order_controller_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=order.routes.js.map