"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const salesController_1 = require("../controllers/salesController");
const router = express_1.default.Router();
router.get('/distributors', salesController_1.getDistributors);
router.get('/distributors/:distributorId/sales/:year/:month', salesController_1.getDistributorSales);
router.post('/distributors/:distributorId/sales', salesController_1.saveDistributorSales);
router.get('/distributors/:distributorId/months', salesController_1.getDistributorMonths);
exports.default = router;
//# sourceMappingURL=sales.js.map