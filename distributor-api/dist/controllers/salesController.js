"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistributorMonths = exports.saveDistributorSales = exports.getDistributorSales = exports.getDistributors = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDistributors = async (req, res) => {
    try {
        const distributors = await prisma.user.findMany({
            where: {
                role: 'DISTRIBUTOR'
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                createdAt: true
            }
        });
        res.json({
            success: true,
            data: distributors
        });
    }
    catch (error) {
        console.error('Error fetching distributors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch distributors'
        });
    }
};
exports.getDistributors = getDistributors;
const getDistributorSales = async (req, res) => {
    try {
        const { distributorId, year, month } = req.params;
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        if (monthNum < 1 || monthNum > 12) {
            res.status(400).json({
                success: false,
                message: 'Invalid month. Must be between 1-12'
            });
            return;
        }
        if (yearNum < 2020 || yearNum > 2030) {
            res.status(400).json({
                success: false,
                message: 'Invalid year'
            });
            return;
        }
        const salesData = await prisma.salesData.findMany({
            where: {
                distributorId: distributorId,
                year: yearNum,
                month: monthNum
            },
            orderBy: [
                { day: 'asc' },
                { row: 'asc' }
            ]
        });
        const distributor = await prisma.user.findUnique({
            where: { id: distributorId },
            select: { id: true, fullName: true, email: true }
        });
        if (!distributor) {
            res.status(404).json({
                success: false,
                message: 'Distributor not found'
            });
            return;
        }
        res.json({
            success: true,
            data: {
                distributor,
                year: yearNum,
                month: monthNum,
                monthName: new Date(yearNum, monthNum - 1).toLocaleDateString('en-US', { month: 'long' }),
                salesData
            }
        });
    }
    catch (error) {
        console.error('Error fetching distributor sales:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch distributor sales data'
        });
    }
};
exports.getDistributorSales = getDistributorSales;
const saveDistributorSales = async (req, res) => {
    try {
        const { distributorId, year, month, salesData } = req.body;
        if (!distributorId || !year || !month || !salesData) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
            return;
        }
        await prisma.salesData.deleteMany({
            where: {
                distributorId,
                year: parseInt(year),
                month: parseInt(month)
            }
        });
        const salesRecords = salesData.map((record) => ({
            distributorId,
            year: parseInt(year),
            month: parseInt(month),
            day: record.day,
            row: record.row,
            cellId: record.cellId,
            value: record.value,
            type: record.type || 'text',
            formula: record.formula || null
        }));
        await prisma.salesData.createMany({
            data: salesRecords
        });
        res.json({
            success: true,
            message: 'Sales data saved successfully'
        });
    }
    catch (error) {
        console.error('Error saving distributor sales:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save sales data'
        });
    }
};
exports.saveDistributorSales = saveDistributorSales;
const getDistributorMonths = async (req, res) => {
    try {
        const { distributorId } = req.params;
        const months = await prisma.salesData.findMany({
            where: {
                distributorId
            },
            select: {
                year: true,
                month: true
            },
            distinct: ['year', 'month'],
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ]
        });
        const formattedMonths = months.map((m) => ({
            year: m.year,
            month: m.month,
            monthName: new Date(m.year, m.month - 1).toLocaleDateString('en-US', { month: 'long' }),
            label: `${new Date(m.year, m.month - 1).toLocaleDateString('en-US', { month: 'short' })} ${m.year}`
        }));
        res.json({
            success: true,
            data: formattedMonths
        });
    }
    catch (error) {
        console.error('Error fetching distributor months:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available months'
        });
    }
};
exports.getDistributorMonths = getDistributorMonths;
//# sourceMappingURL=salesController.js.map