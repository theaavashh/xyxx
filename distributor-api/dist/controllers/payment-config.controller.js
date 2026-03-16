"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadQrCode = exports.deletePaymentConfig = exports.updatePaymentConfig = exports.createPaymentConfig = exports.getPaymentConfig = exports.getPaymentConfigs = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../../uploads/payment-config');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new TypeError('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
const createPaymentConfigSchema = zod_1.z.object({
    qrCodeUrl: zod_1.z.string().url().optional().nullable(),
    bankAccountNumber: zod_1.z.string().optional().nullable(),
    bankAccountName: zod_1.z.string().optional().nullable(),
    bankName: zod_1.z.string().optional().nullable(),
    branchName: zod_1.z.string().optional().nullable(),
    paymentGateway: zod_1.z.string().optional().nullable(),
    paymentGatewayApiKey: zod_1.z.string().optional().nullable(),
    paymentGatewaySecret: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().default(true),
});
const updatePaymentConfigSchema = zod_1.z.object({
    qrCodeUrl: zod_1.z.string().url().optional().nullable(),
    bankAccountNumber: zod_1.z.string().optional().nullable(),
    bankAccountName: zod_1.z.string().optional().nullable(),
    bankName: zod_1.z.string().optional().nullable(),
    branchName: zod_1.z.string().optional().nullable(),
    paymentGateway: zod_1.z.string().optional().nullable(),
    paymentGatewayApiKey: zod_1.z.string().optional().nullable(),
    paymentGatewaySecret: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().optional(),
});
const getPaymentConfigs = async (req, res) => {
    try {
        const configs = await prisma.paymentConfig.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json({
            success: true,
            message: 'Payment configurations retrieved successfully',
            data: configs,
        });
    }
    catch (error) {
        console.error('Error retrieving payment configurations:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : undefined,
        });
    }
    return;
};
exports.getPaymentConfigs = getPaymentConfigs;
const getPaymentConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const config = await prisma.paymentConfig.findUnique({
            where: {
                id,
            },
        });
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Payment configuration not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Payment configuration retrieved successfully',
            data: config,
        });
    }
    catch (error) {
        console.error('Error retrieving payment configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : undefined,
        });
    }
    return;
};
exports.getPaymentConfig = getPaymentConfig;
const createPaymentConfig = async (req, res) => {
    try {
        const validationResult = createPaymentConfigSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationResult.error.errors,
            });
        }
        const { qrCodeUrl, bankAccountNumber, bankAccountName, bankName, branchName, paymentGateway, paymentGatewayApiKey, paymentGatewaySecret, isActive, } = validationResult.data;
        const config = await prisma.paymentConfig.create({
            data: {
                qrCodeUrl: qrCodeUrl || null,
                bankAccountNumber: bankAccountNumber || null,
                bankAccountName: bankAccountName || null,
                bankName: bankName || null,
                branchName: branchName || null,
                paymentGateway: paymentGateway || null,
                paymentGatewayApiKey: paymentGatewayApiKey || null,
                paymentGatewaySecret: paymentGatewaySecret || null,
                isActive: isActive ?? true,
            },
        });
        res.status(201).json({
            success: true,
            message: 'Payment configuration created successfully',
            data: config,
        });
    }
    catch (error) {
        console.error('Error creating payment configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : undefined,
        });
    }
    return;
};
exports.createPaymentConfig = createPaymentConfig;
const updatePaymentConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const validationResult = updatePaymentConfigSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationResult.error.errors,
            });
        }
        const { qrCodeUrl, bankAccountNumber, bankAccountName, bankName, branchName, paymentGateway, paymentGatewayApiKey, paymentGatewaySecret, isActive, } = validationResult.data;
        const existingConfig = await prisma.paymentConfig.findUnique({
            where: {
                id,
            },
        });
        if (!existingConfig) {
            return res.status(404).json({
                success: false,
                message: 'Payment configuration not found',
            });
        }
        const updatedConfig = await prisma.paymentConfig.update({
            where: {
                id,
            },
            data: {
                qrCodeUrl: qrCodeUrl !== undefined ? qrCodeUrl || null : undefined,
                bankAccountNumber: bankAccountNumber !== undefined ? bankAccountNumber || null : undefined,
                bankAccountName: bankAccountName !== undefined ? bankAccountName || null : undefined,
                bankName: bankName !== undefined ? bankName || null : undefined,
                branchName: branchName !== undefined ? branchName || null : undefined,
                paymentGateway: paymentGateway !== undefined ? paymentGateway || null : undefined,
                paymentGatewayApiKey: paymentGatewayApiKey !== undefined ? paymentGatewayApiKey || null : undefined,
                paymentGatewaySecret: paymentGatewaySecret !== undefined ? paymentGatewaySecret || null : undefined,
                isActive: isActive !== undefined ? isActive : undefined,
            },
        });
        res.status(200).json({
            success: true,
            message: 'Payment configuration updated successfully',
            data: updatedConfig,
        });
    }
    catch (error) {
        console.error('Error updating payment configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : undefined,
        });
    }
    return;
};
exports.updatePaymentConfig = updatePaymentConfig;
const deletePaymentConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const existingConfig = await prisma.paymentConfig.findUnique({
            where: {
                id,
            },
        });
        if (!existingConfig) {
            return res.status(404).json({
                success: false,
                message: 'Payment configuration not found',
            });
        }
        await prisma.paymentConfig.delete({
            where: {
                id,
            },
        });
        res.status(200).json({
            success: true,
            message: 'Payment configuration deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting payment configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : undefined,
        });
    }
    return;
};
exports.deletePaymentConfig = deletePaymentConfig;
const uploadQrCode = (req, res) => {
    upload.single('qrCode')(req, res, (err) => {
        if (err) {
            if (err.message === 'Only image files are allowed!' || err.message.includes('Only image')) {
                return res.status(400).json({
                    success: false,
                    message: 'Only image files are allowed!',
                });
            }
            if (err instanceof multer_1.default.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File too large. Maximum size is 5MB.',
                    });
                }
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error',
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }
        const filePath = `/uploads/payment-config/${req.file.filename}`;
        res.status(200).json({
            success: true,
            message: 'QR code uploaded successfully',
            data: {
                fileName: req.file.filename,
                filePath: filePath,
                originalName: req.file.originalname,
            },
        });
        return;
    });
    return;
};
exports.uploadQrCode = uploadQrCode;
//# sourceMappingURL=payment-config.controller.js.map