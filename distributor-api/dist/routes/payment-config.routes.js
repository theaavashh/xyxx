"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_config_controller_1 = require("../controllers/payment-config.controller");
const router = (0, express_1.Router)();
router.get('/', payment_config_controller_1.getPaymentConfigs);
router.get('/:id', payment_config_controller_1.getPaymentConfig);
router.post('/', payment_config_controller_1.createPaymentConfig);
router.put('/:id', payment_config_controller_1.updatePaymentConfig);
router.delete('/:id', payment_config_controller_1.deletePaymentConfig);
exports.default = router;
//# sourceMappingURL=payment-config.routes.js.map