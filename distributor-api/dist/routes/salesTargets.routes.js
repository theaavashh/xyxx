"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const error_middleware_1 = require("../middleware/error.middleware");
const salesTargets_controller_1 = require("../controllers/salesTargets.controller");
const router = (0, express_1.Router)();
router.get('/distributors', (0, error_middleware_1.asyncHandler)(salesTargets_controller_1.getDistributors));
router.post('/distributors', (0, error_middleware_1.asyncHandler)(salesTargets_controller_1.addDistributor));
router.get('/product-categories', (0, error_middleware_1.asyncHandler)(salesTargets_controller_1.getProductCategories));
router.get('/products/:categoryId', (0, error_middleware_1.asyncHandler)(salesTargets_controller_1.getProductsByCategory));
router.get('/distributor-targets', (0, error_middleware_1.asyncHandler)(salesTargets_controller_1.getDistributorTargets));
router.post('/distributor-targets', (0, error_middleware_1.asyncHandler)(salesTargets_controller_1.saveDistributorTargets));
exports.default = router;
//# sourceMappingURL=salesTargets.routes.js.map