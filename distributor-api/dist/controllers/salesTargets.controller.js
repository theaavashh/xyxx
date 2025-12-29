"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesTargetStats = exports.deleteSalesTarget = exports.updateSalesTarget = exports.createSalesTarget = exports.getSalesTargets = void 0;
const client_1 = require("@prisma/client");
const error_middleware_1 = require("../middleware/error.middleware");
const prisma = new client_1.PrismaClient();
exports.getSalesTargets = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { month, year, province } = req.query;
    const where = {};
    if (month)
        where.month = month;
    if (year)
        where.year = parseInt(year);
    if (province)
        where.province = province;
    const targets = await prisma.salesTarget.findMany({
        where,
        orderBy: [
            { year: 'desc' },
            { month: 'asc' },
            { province: 'asc' }
        ]
    });
    const response = {
        success: true,
        message: 'Sales targets retrieved successfully',
        data: targets
    };
    res.status(200).json(response);
});
exports.createSalesTarget = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { month, year, province, targetAmount } = req.body;
    if (!month || !year || !province || !targetAmount) {
        const response = {
            success: false,
            message: 'All fields are required',
            error: 'MISSING_REQUIRED_FIELDS'
        };
        res.status(400).json(response);
        return;
    }
    const existingTarget = await prisma.salesTarget.findFirst({
        where: {
            month,
            year: parseInt(year),
            province
        }
    });
    if (existingTarget) {
        const response = {
            success: false,
            message: 'Sales target already exists for this month and province',
            error: 'TARGET_ALREADY_EXISTS'
        };
        res.status(409).json(response);
        return;
    }
    const target = await prisma.salesTarget.create({
        data: {
            month,
            year: parseInt(year),
            province,
            targetAmount: parseFloat(targetAmount),
            createdBy: req.user?.id || 'system'
        }
    });
    const response = {
        success: true,
        message: 'Sales target created successfully',
        data: target
    };
    res.status(201).json(response);
});
exports.updateSalesTarget = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { month, year, province, targetAmount } = req.body;
    const existingTarget = await prisma.salesTarget.findUnique({
        where: { id }
    });
    if (!existingTarget) {
        const response = {
            success: false,
            message: 'Sales target not found',
            error: 'TARGET_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    if (month && year && province) {
        const duplicateTarget = await prisma.salesTarget.findFirst({
            where: {
                month,
                year: parseInt(year),
                province,
                id: { not: id }
            }
        });
        if (duplicateTarget) {
            const response = {
                success: false,
                message: 'Another sales target already exists for this month and province',
                error: 'DUPLICATE_TARGET'
            };
            res.status(409).json(response);
            return;
        }
    }
    const updateData = {};
    if (month)
        updateData.month = month;
    if (year)
        updateData.year = parseInt(year);
    if (province)
        updateData.province = province;
    if (targetAmount)
        updateData.targetAmount = parseFloat(targetAmount);
    const target = await prisma.salesTarget.update({
        where: { id },
        data: updateData
    });
    const response = {
        success: true,
        message: 'Sales target updated successfully',
        data: target
    };
    res.status(200).json(response);
});
exports.deleteSalesTarget = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existingTarget = await prisma.salesTarget.findUnique({
        where: { id }
    });
    if (!existingTarget) {
        const response = {
            success: false,
            message: 'Sales target not found',
            error: 'TARGET_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    await prisma.salesTarget.delete({
        where: { id }
    });
    const response = {
        success: true,
        message: 'Sales target deleted successfully'
    };
    res.status(200).json(response);
});
exports.getSalesTargetStats = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { year } = req.query;
    const where = {};
    if (year)
        where.year = parseInt(year);
    const [totalTargets, totalAmount, provinceCount] = await Promise.all([
        prisma.salesTarget.count({ where }),
        prisma.salesTarget.aggregate({
            where,
            _sum: { targetAmount: true }
        }),
        prisma.salesTarget.groupBy({
            by: ['province'],
            where,
            _count: { province: true }
        })
    ]);
    const stats = {
        totalTargets,
        totalAmount: totalAmount._sum.targetAmount || 0,
        uniqueProvinces: provinceCount.length,
        averageTarget: totalTargets > 0 ? (totalAmount._sum.targetAmount || 0) / totalTargets : 0
    };
    const response = {
        success: true,
        message: 'Sales target statistics retrieved successfully',
        data: stats
    };
    res.status(200).json(response);
});
//# sourceMappingURL=salesTargets.controller.js.map