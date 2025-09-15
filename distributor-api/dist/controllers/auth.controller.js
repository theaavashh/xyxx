"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.deleteUser = exports.updateUserStatus = exports.getAllUsers = exports.refreshToken = exports.logout = exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const error_middleware_1 = require("@/middleware/error.middleware");
const prisma = new client_1.PrismaClient();
const generateToken = (userId, email, role) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
    }
    const payload = {
        userId,
        email,
        role: role
    };
    return jsonwebtoken_1.default.sign(payload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};
exports.register = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userData = req.body;
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: userData.email },
                { username: userData.username }
            ]
        }
    });
    if (existingUser) {
        const isEmailTaken = existingUser.email === userData.email;
        const response = {
            success: false,
            message: isEmailTaken ? 'This email address is already in use' : 'This username is already taken',
            error: isEmailTaken ? 'EMAIL_ALREADY_EXISTS' : 'USERNAME_ALREADY_EXISTS'
        };
        res.status(409).json(response);
        return;
    }
    const saltRounds = 12;
    const hashedPassword = await bcryptjs_1.default.hash(userData.password, saltRounds);
    const user = await prisma.user.create({
        data: {
            email: userData.email,
            username: userData.username,
            fullName: userData.fullName,
            password: hashedPassword,
            address: userData.address,
            department: userData.department,
            position: userData.position,
            role: userData.role
        },
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            address: true,
            department: true,
            position: true,
            role: true,
            isActive: true,
            createdAt: true
        }
    });
    const token = generateToken(user.id, user.email, user.role);
    const response = {
        success: true,
        message: 'User successfully registered',
        data: {
            user,
            token
        }
    };
    res.status(201).json(response);
});
exports.login = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            password: true,
            address: true,
            department: true,
            position: true,
            role: true,
            isActive: true,
            createdAt: true
        }
    });
    if (!user) {
        const response = {
            success: false,
            message: 'Invalid email or password',
            error: 'INVALID_CREDENTIALS'
        };
        res.status(401).json(response);
        return;
    }
    if (!user.isActive) {
        const response = {
            success: false,
            message: 'User account is inactive',
            error: 'ACCOUNT_INACTIVE'
        };
        res.status(401).json(response);
        return;
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        const response = {
            success: false,
            message: 'Invalid email or password',
            error: 'INVALID_CREDENTIALS'
        };
        res.status(401).json(response);
        return;
    }
    const token = generateToken(user.id, user.email, user.role);
    const response = {
        success: true,
        message: 'Login successful',
        data: {
            username: user.username,
            role: user.role,
            token
        }
    };
    res.status(200).json(response);
});
exports.getProfile = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const response = {
        success: true,
        message: 'प्रयोगकर्ता प्रोफाइल',
        data: { user: req.user }
    };
    res.status(200).json(response);
});
exports.updateProfile = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const updateData = req.body;
    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            ...(updateData.fullName && { fullName: updateData.fullName }),
            ...(updateData.username && { username: updateData.username }),
            ...(updateData.address && { address: updateData.address }),
            ...(updateData.department && { department: updateData.department }),
            ...(updateData.position && { position: updateData.position })
        },
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            address: true,
            department: true,
            position: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });
    const response = {
        success: true,
        message: 'प्रोफाइल सफलतापूर्वक अपडेट भयो',
        data: { user: updatedUser }
    };
    res.status(200).json(response);
});
exports.changePassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, password: true }
    });
    if (!user) {
        const response = {
            success: false,
            message: 'प्रयोगकर्ता फेला परेन',
            error: 'USER_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        const response = {
            success: false,
            message: 'हालको पासवर्ड गलत छ',
            error: 'INVALID_CURRENT_PASSWORD'
        };
        res.status(400).json(response);
        return;
    }
    const saltRounds = 12;
    const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
    await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedNewPassword }
    });
    const response = {
        success: true,
        message: 'पासवर्ड सफलतापूर्वक परिवर्तन भयो'
    };
    res.status(200).json(response);
});
exports.logout = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const response = {
        success: true,
        message: 'सफलतापूर्वक लगआउट भयो'
    };
    res.status(200).json(response);
});
exports.refreshToken = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const token = generateToken(req.user.id, req.user.email, req.user.role);
    const response = {
        success: true,
        message: 'टोकन रिफ्रेश भयो',
        data: { token }
    };
    res.status(200).json(response);
});
exports.getAllUsers = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGERIAL' && req.user.role !== 'SALES_MANAGER') {
        const response = {
            success: false,
            message: 'Insufficient permissions for this action',
            error: 'INSUFFICIENT_PERMISSIONS'
        };
        res.status(403).json(response);
        return;
    }
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            address: true,
            department: true,
            position: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    const response = {
        success: true,
        message: 'सबै प्रयोगकर्ताहरूको सूची',
        data: users
    };
    res.status(200).json(response);
});
exports.updateUserStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGERIAL' && req.user.role !== 'SALES_MANAGER') {
        const response = {
            success: false,
            message: 'Insufficient permissions for this action',
            error: 'INSUFFICIENT_PERMISSIONS'
        };
        res.status(403).json(response);
        return;
    }
    const { userId } = req.params;
    const { isActive } = req.body;
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            address: true,
            department: true,
            position: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });
    const response = {
        success: true,
        message: `प्रयोगकर्ता ${isActive ? 'सक्रिय' : 'निष्क्रिय'} गरियो`,
        data: { user: updatedUser }
    };
    res.status(200).json(response);
});
exports.deleteUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGERIAL' && req.user.role !== 'SALES_MANAGER') {
        const response = {
            success: false,
            message: 'Insufficient permissions for this action',
            error: 'INSUFFICIENT_PERMISSIONS'
        };
        res.status(403).json(response);
        return;
    }
    const { userId } = req.params;
    if (req.user.id === userId) {
        const response = {
            success: false,
            message: 'Cannot delete your own account',
            error: 'SELF_DELETE_NOT_ALLOWED'
        };
        res.status(400).json(response);
        return;
    }
    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            const response = {
                success: false,
                message: 'User not found',
                error: 'USER_NOT_FOUND'
            };
            res.status(404).json(response);
            return;
        }
        await prisma.user.delete({
            where: { id: userId }
        });
        const response = {
            success: true,
            message: 'User deleted successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error deleting user:', error);
        const response = {
            success: false,
            message: 'Failed to delete user',
            error: 'DELETE_FAILED'
        };
        res.status(500).json(response);
    }
});
exports.updateUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGERIAL' && req.user.role !== 'SALES_MANAGER') {
        const response = {
            success: false,
            message: 'Insufficient permissions for this action',
            error: 'INSUFFICIENT_PERMISSIONS'
        };
        res.status(403).json(response);
        return;
    }
    const { userId } = req.params;
    const updateData = req.body;
    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            const response = {
                success: false,
                message: 'User not found',
                error: 'USER_NOT_FOUND'
            };
            res.status(404).json(response);
            return;
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(updateData.fullName && { fullName: updateData.fullName }),
                ...(updateData.username && { username: updateData.username }),
                ...(updateData.email && { email: updateData.email }),
                ...(updateData.address && { address: updateData.address }),
                ...(updateData.department && { department: updateData.department }),
                ...(updateData.position && { position: updateData.position }),
                ...(updateData.role && { role: updateData.role }),
                ...(updateData.isActive !== undefined && { isActive: updateData.isActive })
            },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                address: true,
                department: true,
                position: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        const response = {
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating user:', error);
        const response = {
            success: false,
            message: 'Failed to update user',
            error: 'UPDATE_FAILED'
        };
        res.status(500).json(response);
    }
});
//# sourceMappingURL=auth.controller.js.map