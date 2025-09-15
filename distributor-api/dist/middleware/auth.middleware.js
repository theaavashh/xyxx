"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccessApplication = exports.optionalAuth = exports.authorize = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            const response = {
                success: false,
                message: 'पहुँच टोकन आवश्यक छ',
                error: 'Access token required'
            };
            res.status(401).json(response);
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user || !user.isActive) {
            const response = {
                success: false,
                message: 'अवैध वा निष्क्रिय प्रयोगकर्ता',
                error: 'Invalid or inactive user'
            };
            res.status(401).json(response);
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        let message = 'अवैध टोकन';
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            message = 'टोकनको समय सकिएको छ';
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            message = 'अवैध टोकन';
        }
        const response = {
            success: false,
            message,
            error: 'Authentication failed'
        };
        res.status(401).json(response);
    }
};
exports.authenticateToken = authenticateToken;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            const response = {
                success: false,
                message: 'प्रमाणीकरण आवश्यक छ',
                error: 'Authentication required'
            };
            res.status(401).json(response);
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            const response = {
                success: false,
                message: 'यो कार्य गर्न अनुमति छैन',
                error: 'Insufficient permissions'
            };
            res.status(403).json(response);
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            next();
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            next();
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (user && user.isActive) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const canAccessApplication = async (req, res, next) => {
    try {
        if (!req.user) {
            const response = {
                success: false,
                message: 'प्रमाणीकरण आवश्यक छ',
                error: 'Authentication required'
            };
            res.status(401).json(response);
            return;
        }
        const applicationId = req.params.id;
        if (!applicationId) {
            const response = {
                success: false,
                message: 'आवेदन ID आवश्यक छ',
                error: 'Application ID required'
            };
            res.status(400).json(response);
            return;
        }
        if (req.user.role === 'ADMIN' || req.user.role === 'SALES_MANAGER') {
            next();
            return;
        }
        if (req.user.role === 'SALES_REPRESENTATIVE') {
            const application = await prisma.distributorApplication.findUnique({
                where: { id: applicationId },
                select: {
                    id: true,
                    createdById: true,
                    reviewedById: true
                }
            });
            if (!application) {
                const response = {
                    success: false,
                    message: 'आवेदन फेला परेन',
                    error: 'Application not found'
                };
                res.status(404).json(response);
                return;
            }
            if (application.createdById === req.user.id || application.reviewedById === req.user.id) {
                next();
                return;
            }
        }
        const response = {
            success: false,
            message: 'यो आवेदन पहुँच गर्न अनुमति छैन',
            error: 'Access denied to this application'
        };
        res.status(403).json(response);
    }
    catch (error) {
        console.error('Authorization error:', error);
        const response = {
            success: false,
            message: 'प्राधिकरण जाँच गर्दा त्रुटि',
            error: 'Authorization check failed'
        };
        res.status(500).json(response);
    }
};
exports.canAccessApplication = canAccessApplication;
//# sourceMappingURL=auth.middleware.js.map