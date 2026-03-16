"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const distributor_auth_controller_1 = require("../controllers/distributor-auth.controller");
const auth_schema_1 = require("../schemas/auth.schema");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
router.post('/login', rate_limit_middleware_1.authLimiter, validation_middleware_1.sanitizeInput, (0, validation_middleware_1.validate)(auth_schema_1.LoginSchema), distributor_auth_controller_1.distributorLogin);
router.post('/logout', auth_middleware_1.authenticateToken, distributor_auth_controller_1.distributorLogout);
router.get('/profile', auth_middleware_1.authenticateToken, distributor_auth_controller_1.getDistributorProfile);
exports.default = router;
//# sourceMappingURL=distributor-auth.routes.js.map