"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentSalesDashboard = exports.addCurrentSalesEntry = exports.getAllCurrentSales = exports.getCurrentSales = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getCurrentSales = async (req, res) => {
    try {
        const { distributorId } = req.params;
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const salesData = await prisma.salesData.findMany({
            where: {
                distributorId: distributorId,
                year: currentYear,
                month: currentMonth
            },
            orderBy: [
                { day: 'asc' },
                { row: 'asc' }
            ]
        });
        const distributor = await prisma.user.findUnique({
            where: { id: distributorId },
            select: {
                id: true,
                fullName: true,
                email: true,
                distributorProfile: {
                    select: {
                        companyName: true
                    }
                }
            }
        });
        if (!distributor) {
            res.status(404).json({
                success: false,
                message: 'Distributor not found'
            });
            return;
        }
        const totalDays = salesData.length > 0 ? Math.max(...salesData.map(s => s.day)) : 0;
        const totalSales = salesData
            .filter(s => s.type === 'number' && !isNaN(parseFloat(s.value)))
            .reduce((sum, s) => sum + parseFloat(s.value), 0);
        const today = now.getDate();
        const todaySales = salesData
            .filter(s => s.day === today && s.type === 'number' && !isNaN(parseFloat(s.value)))
            .reduce((sum, s) => sum + parseFloat(s.value), 0);
        res.json({
            success: true,
            data: {
                distributor: {
                    id: distributor.id,
                    name: distributor.fullName,
                    email: distributor.email,
                    companyName: distributor.distributorProfile?.companyName || 'N/A'
                },
                period: {
                    year: currentYear,
                    month: currentMonth,
                    monthName: now.toLocaleDateString('en-US', { month: 'long' }),
                    currentDay: today
                },
                summary: {
                    totalDays,
                    totalSales,
                    todaySales,
                    averageDailySales: totalDays > 0 ? totalSales / totalDays : 0
                },
                salesData
            }
        });
    }
    catch (error) {
        console.error('Error fetching current sales:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch current sales data'
        });
    }
};
exports.getCurrentSales = getCurrentSales;
const getAllCurrentSales = async (req, res) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const distributors = await prisma.user.findMany({
            where: {
                role: 'DISTRIBUTOR'
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                distributorProfile: {
                    select: {
                        companyName: true
                    }
                },
                salesData: {
                    where: {
                        year: currentYear,
                        month: currentMonth
                    }
                }
            }
        });
        const distributorSummaries = distributors.map(distributor => {
            const salesData = distributor.salesData;
            const totalSales = salesData
                .filter(s => s.type === 'number' && !isNaN(parseFloat(s.value)))
                .reduce((sum, s) => sum + parseFloat(s.value), 0);
            const today = now.getDate();
            const todaySales = salesData
                .filter(s => s.day === today && s.type === 'number' && !isNaN(parseFloat(s.value)))
                .reduce((sum, s) => sum + parseFloat(s.value), 0);
            return {
                id: distributor.id,
                name: distributor.fullName,
                email: distributor.email,
                companyName: distributor.distributorProfile?.companyName || 'N/A',
                totalSales,
                todaySales,
                dataPoints: salesData.length
            };
        });
        const overallTotalSales = distributorSummaries.reduce((sum, d) => sum + d.totalSales, 0);
        const overallTodaySales = distributorSummaries.reduce((sum, d) => sum + d.todaySales, 0);
        res.json({
            success: true,
            data: {
                period: {
                    year: currentYear,
                    month: currentMonth,
                    monthName: now.toLocaleDateString('en-US', { month: 'long' })
                },
                summary: {
                    totalDistributors: distributors.length,
                    overallTotalSales,
                    overallTodaySales,
                    averageSalesPerDistributor: distributors.length > 0 ? overallTotalSales / distributors.length : 0
                },
                distributors: distributorSummaries
            }
        });
    }
    catch (error) {
        console.error('Error fetching all current sales:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch current sales data'
        });
    }
};
exports.getAllCurrentSales = getAllCurrentSales;
const addCurrentSalesEntry = async (req, res) => {
    try {
        const { distributorId, day, row, cellId, value, type = 'text', formula } = req.body;
        if (!distributorId || !day || !row || !cellId || value === undefined) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields: distributorId, day, row, cellId, value'
            });
            return;
        }
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const existingEntry = await prisma.salesData.findUnique({
            where: {
                distributorId_year_month_day_row: {
                    distributorId,
                    year: currentYear,
                    month: currentMonth,
                    day: parseInt(day),
                    row: parseInt(row)
                }
            }
        });
        if (existingEntry) {
            const updatedEntry = await prisma.salesData.update({
                where: {
                    id: existingEntry.id
                },
                data: {
                    value: value.toString(),
                    type,
                    formula: formula || null
                }
            });
            res.json({
                success: true,
                message: 'Sales entry updated successfully',
                data: updatedEntry
            });
        }
        else {
            const newEntry = await prisma.salesData.create({
                data: {
                    distributorId,
                    year: currentYear,
                    month: currentMonth,
                    day: parseInt(day),
                    row: parseInt(row),
                    cellId,
                    value: value.toString(),
                    type,
                    formula: formula || null
                }
            });
            res.json({
                success: true,
                message: 'Sales entry added successfully',
                data: newEntry
            });
        }
    }
    catch (error) {
        console.error('Error adding current sales entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add sales entry'
        });
    }
};
exports.addCurrentSalesEntry = addCurrentSalesEntry;
const getCurrentSalesDashboard = async (req, res) => {
    try {
        const { distributorId } = req.params;
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentMonthSales = await prisma.salesData.findMany({
            where: {
                distributorId: distributorId,
                year: currentYear,
                month: currentMonth
            }
        });
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const previousMonthSales = await prisma.salesData.findMany({
            where: {
                distributorId: distributorId,
                year: previousYear,
                month: previousMonth
            }
        });
        const currentTotal = currentMonthSales
            .filter(s => s.type === 'number' && !isNaN(parseFloat(s.value)))
            .reduce((sum, s) => sum + parseFloat(s.value), 0);
        const previousTotal = previousMonthSales
            .filter(s => s.type === 'number' && !isNaN(parseFloat(s.value)))
            .reduce((sum, s) => sum + parseFloat(s.value), 0);
        const growthPercentage = previousTotal > 0
            ? ((currentTotal - previousTotal) / previousTotal) * 100
            : 0;
        const dailySales = [];
        for (let day = 1; day <= now.getDate(); day++) {
            const daySales = currentMonthSales
                .filter(s => s.day === day && s.type === 'number' && !isNaN(parseFloat(s.value)))
                .reduce((sum, s) => sum + parseFloat(s.value), 0);
            dailySales.push({
                day,
                sales: daySales
            });
        }
        res.json({
            success: true,
            data: {
                summary: {
                    currentMonthTotal: currentTotal,
                    previousMonthTotal: previousTotal,
                    growthPercentage,
                    daysInMonth: now.getDate(),
                    averageDailySales: currentTotal / now.getDate()
                },
                dailyTrend: dailySales,
                period: {
                    current: {
                        year: currentYear,
                        month: currentMonth,
                        monthName: now.toLocaleDateString('en-US', { month: 'long' })
                    },
                    previous: {
                        year: previousYear,
                        month: previousMonth,
                        monthName: new Date(previousYear, previousMonth - 1).toLocaleDateString('en-US', { month: 'long' })
                    }
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching current sales dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    }
};
exports.getCurrentSalesDashboard = getCurrentSalesDashboard;
//# sourceMappingURL=currentSalesController.js.map