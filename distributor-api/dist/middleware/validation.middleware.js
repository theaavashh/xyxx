"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = exports.validateParams = exports.validateQuery = exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(err.message);
                });
                const response = {
                    success: false,
                    message: 'प्रविष्ट गरिएको डाटा सही छैन',
                    error: 'Validation failed',
                    errors
                };
                res.status(400).json(response);
                return;
            }
            console.error('Validation middleware error:', error);
            const response = {
                success: false,
                message: 'डाटा प्रमाणीकरण गर्दा त्रुटि',
                error: 'Validation error'
            };
            res.status(500).json(response);
        }
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(err.message);
                });
                const response = {
                    success: false,
                    message: 'क्वेरी प्यारामिटर सही छैन',
                    error: 'Query validation failed',
                    errors
                };
                res.status(400).json(response);
                return;
            }
            console.error('Query validation middleware error:', error);
            const response = {
                success: false,
                message: 'क्वेरी प्रमाणीकरण गर्दा त्रुटि',
                error: 'Query validation error'
            };
            res.status(500).json(response);
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(err.message);
                });
                const response = {
                    success: false,
                    message: 'रुट प्यारामिटर सही छैन',
                    error: 'Parameter validation failed',
                    errors
                };
                res.status(400).json(response);
                return;
            }
            console.error('Parameter validation middleware error:', error);
            const response = {
                success: false,
                message: 'प्यारामिटर प्रमाणीकरण गर्दा त्रुटि',
                error: 'Parameter validation error'
            };
            res.status(500).json(response);
        }
    };
};
exports.validateParams = validateParams;
const sanitizeInput = (req, res, next) => {
    try {
        const sanitizeObject = (obj) => {
            if (typeof obj === 'string') {
                return obj.trim();
            }
            if (Array.isArray(obj)) {
                return obj.map(sanitizeObject);
            }
            if (obj && typeof obj === 'object') {
                const sanitized = {};
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        sanitized[key] = sanitizeObject(obj[key]);
                    }
                }
                return sanitized;
            }
            return obj;
        };
        if (req.body) {
            req.body = sanitizeObject(req.body);
        }
        if (req.query) {
            req.query = sanitizeObject(req.query);
        }
        next();
    }
    catch (error) {
        console.error('Input sanitization error:', error);
        const response = {
            success: false,
            message: 'डाटा सफा गर्दा त्रुटि',
            error: 'Input sanitization error'
        };
        res.status(500).json(response);
    }
};
exports.sanitizeInput = sanitizeInput;
//# sourceMappingURL=validation.middleware.js.map