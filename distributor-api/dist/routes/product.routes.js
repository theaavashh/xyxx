"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("@/controllers/product.controller");
const router = (0, express_1.Router)();
router.get('/', product_controller_1.getProducts);
router.get('/categories', product_controller_1.getProductCategories);
router.get('/:id', product_controller_1.getProductById);
exports.default = router;
//# sourceMappingURL=product.routes.js.map