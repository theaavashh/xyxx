"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetLimiter = exports.uploadLimiter = exports.applicationLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        success: false,
        message: 'धेरै अनुरोधहरू पठाइएको छ। केही समय पछि प्रयास गर्नुहोस्।',
        error: 'TOO_MANY_REQUESTS'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const response = {
            success: false,
            message: 'धेरै अनुरोधहरू पठाइएको छ। केही समय पछि प्रयास गर्नुहोस्।',
            error: 'TOO_MANY_REQUESTS'
        };
        res.status(429).json(response);
    }
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'धेरै लगइन प्रयासहरू। १५ मिनेट पछि प्रयास गर्नुहोस्।',
        error: 'TOO_MANY_LOGIN_ATTEMPTS'
    },
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        const response = {
            success: false,
            message: 'धेरै लगइन प्रयासहरू। १५ मिनेट पछि प्रयास गर्नुहोस्।',
            error: 'TOO_MANY_LOGIN_ATTEMPTS'
        };
        res.status(429).json(response);
    }
});
exports.applicationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: 'धेरै आवेदनहरू पठाइएको छ। १ घण्टा पछि प्रयास गर्नुहोस्।',
        error: 'TOO_MANY_APPLICATIONS'
    },
    handler: (req, res) => {
        const response = {
            success: false,
            message: 'धेरै आवेदनहरू पठाइएको छ। १ घण्टा पछि प्रयास गर्नुहोस्।',
            error: 'TOO_MANY_APPLICATIONS'
        };
        res.status(429).json(response);
    }
});
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'धेरै फाइल अपलोड प्रयासहरू। १० मिनेट पछि प्रयास गर्नुहोस्।',
        error: 'TOO_MANY_UPLOADS'
    },
    handler: (req, res) => {
        const response = {
            success: false,
            message: 'धेरै फाइल अपलोड प्रयासहरू। १० मिनेट पछि प्रयास गर्नुहोस्।',
            error: 'TOO_MANY_UPLOADS'
        };
        res.status(429).json(response);
    }
});
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: 'धेरै पासवर्ड रिसेट प्रयासहरू। १ घण्टा पछि प्रयास गर्नुहोस्।',
        error: 'TOO_MANY_PASSWORD_RESET_ATTEMPTS'
    },
    handler: (req, res) => {
        const response = {
            success: false,
            message: 'धेरै पासवर्ड रिसेट प्रयासहरू। १ घण्टा पछि प्रयास गर्नुहोस्।',
            error: 'TOO_MANY_PASSWORD_RESET_ATTEMPTS'
        };
        res.status(429).json(response);
    }
});
//# sourceMappingURL=rate-limit.middleware.js.map