import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get current sales data for a distributor (current month and year)
export const getCurrentSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { distributorId } = req.params;
    
    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Get sales data for the current month
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

    // Get distributor info
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

    // Calculate summary statistics
    const totalDays = salesData.length > 0 ? Math.max(...salesData.map(s => s.day)) : 0;
    const totalSales = salesData
      .filter(s => s.type === 'number' && !isNaN(parseFloat(s.value)))
      .reduce((sum, s) => sum + parseFloat(s.value), 0);

    // Get today's sales
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
  } catch (error) {
    console.error('Error fetching current sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current sales data'
    });
  }
};

// Get current sales summary for all distributors (admin view)
export const getAllCurrentSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Get all distributors with sales data
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

    // Calculate summary for each distributor
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

    // Calculate overall summary
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
  } catch (error) {
    console.error('Error fetching all current sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current sales data'
    });
  }
};

// Add current sales entry
export const addCurrentSalesEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { distributorId, day, row, cellId, value, type = 'text', formula } = req.body;
    
    // Validate required fields
    if (!distributorId || !day || !row || !cellId || value === undefined) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: distributorId, day, row, cellId, value'
      });
      return;
    }

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Check if entry already exists and update or create
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
      // Update existing entry
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
    } else {
      // Create new entry
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
  } catch (error) {
    console.error('Error adding current sales entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add sales entry'
    });
  }
};

// Get current sales dashboard data
export const getCurrentSalesDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { distributorId } = req.params;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Get current month sales data
    const currentMonthSales = await prisma.salesData.findMany({
      where: {
        distributorId: distributorId,
        year: currentYear,
        month: currentMonth
      }
    });

    // Get previous month sales data for comparison
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const previousMonthSales = await prisma.salesData.findMany({
      where: {
        distributorId: distributorId,
        year: previousYear,
        month: previousMonth
      }
    });

    // Calculate totals
    const currentTotal = currentMonthSales
      .filter(s => s.type === 'number' && !isNaN(parseFloat(s.value)))
      .reduce((sum, s) => sum + parseFloat(s.value), 0);

    const previousTotal = previousMonthSales
      .filter(s => s.type === 'number' && !isNaN(parseFloat(s.value)))
      .reduce((sum, s) => sum + parseFloat(s.value), 0);

    // Calculate growth percentage
    const growthPercentage = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0;

    // Get daily sales trend for current month
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
  } catch (error) {
    console.error('Error fetching current sales dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};