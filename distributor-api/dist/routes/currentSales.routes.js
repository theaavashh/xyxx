"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const currentSalesController_1 = require("../controllers/currentSalesController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/distributors/:distributorId', auth_middleware_1.authenticateToken, currentSalesController_1.getCurrentSales);
router.get('/distributors/:distributorId/dashboard', auth_middleware_1.authenticateToken, currentSalesController_1.getCurrentSalesDashboard);
router.post('/distributors/:distributorId/entries', auth_middleware_1.authenticateToken, currentSalesController_1.addCurrentSalesEntry);
router.get('/all', auth_middleware_1.authenticateToken, currentSalesController_1.getAllCurrentSales);
exports.default = router;
//# sourceMappingURL=currentSales.routes.js.map