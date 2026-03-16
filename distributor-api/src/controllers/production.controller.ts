import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Raw Material Management
export const getRawMaterials = async (req: Request, res: Response) => {
  try {
    const materials = await prisma.rawMaterial.findMany({
      include: {
        category: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(materials);
  } catch (error) {
    logger.error('Error fetching raw materials:', error);
    res.status(500).json({ error: 'Failed to fetch raw materials' });
  }
};

export const getRawMaterialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const material = await prisma.rawMaterial.findUnique({
      where: { id },
      include: {
        category: true,
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!material) {
      return res.status(404).json({ error: 'Raw material not found' });
    }

    return res.json(material);
  } catch (error) {
    logger.error('Error fetching raw material:', error);
    return res.status(500).json({ error: 'Failed to fetch raw material' });
  }
};

export const createRawMaterial = async (req: Request, res: Response) => {
  try {
    const materialData = req.body;
    
    // Generate material code if not provided
    if (!materialData.materialCode) {
      const count = await prisma.rawMaterial.count();
      materialData.materialCode = `RM${String(count + 1).padStart(3, '0')}`;
    }

    // Find category by name if category is provided as string
    let categoryId = materialData.categoryId;
    if (materialData.category && !categoryId) {
      const category = await prisma.rawMaterialCategory.findFirst({
        where: { name: materialData.category }
      });
      if (category) {
        categoryId = category.id;
      } else {
        return res.status(400).json({ error: 'Category not found' });
      }
    }

    // Remove category name from data and use categoryId
    const { category, ...createData } = materialData;
    createData.categoryId = categoryId;

    const material = await prisma.rawMaterial.create({
      data: createData,
      include: {
        category: true
      }
    });

    return res.status(201).json(material);
  } catch (error) {
    logger.error('Error creating raw material:', error);
    return res.status(500).json({ error: 'Failed to create raw material' });
  }
};

export const updateRawMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find category by name if category is provided as string
    let categoryId = updateData.categoryId;
    if (updateData.category && !categoryId) {
      const category = await prisma.rawMaterialCategory.findFirst({
        where: { name: updateData.category }
      });
      if (category) {
        categoryId = category.id;
      } else {
        return res.status(400).json({ error: 'Category not found' });
      }
    }

    // Remove category name from data and use categoryId
    const { category, ...updateFields } = updateData;
    if (categoryId) {
      updateFields.categoryId = categoryId;
    }

    const material = await prisma.rawMaterial.update({
      where: { id },
      data: updateFields,
      include: {
        category: true
      }
    });

    return res.json(material);
  } catch (error) {
    logger.error('Error updating raw material:', error);
    return res.status(500).json({ error: 'Failed to update raw material' });
  }
};

export const deleteRawMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.rawMaterial.delete({
      where: { id }
    });

    res.json({ message: 'Raw material deleted successfully' });
  } catch (error) {
    logger.error('Error deleting raw material:', error);
    res.status(500).json({ error: 'Failed to delete raw material' });
  }
};

export const getRawMaterialCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.rawMaterialCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    logger.error('Error fetching raw material categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createRawMaterialCategory = async (req: Request, res: Response) => {
  try {
    const categoryData = req.body;
    const category = await prisma.rawMaterialCategory.create({
      data: categoryData
    });

    res.status(201).json(category);
  } catch (error) {
    logger.error('Error creating raw material category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateRawMaterialCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await prisma.rawMaterialCategory.update({
      where: { id },
      data: updateData
    });

    res.json(category);
  } catch (error) {
    logger.error('Error updating raw material category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteRawMaterialCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.rawMaterialCategory.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Error deleting raw material category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

export const getRawMaterialTransactions = async (req: Request, res: Response) => {
  try {
    const { materialId } = req.query;
    
    const where = materialId ? { materialId: materialId as string } : {};
    
    const transactions = await prisma.rawMaterialTransaction.findMany({
      where,
      include: {
        material: {
          select: {
            materialName: true,
            materialCode: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(transactions);
  } catch (error) {
    logger.error('Error fetching raw material transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Production Orders
export const getProductionOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.productionOrder.findMany({
      include: {
        workCenter: true,
        records: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    logger.error('Error fetching production orders:', error);
    res.status(500).json({ error: 'Failed to fetch production orders' });
  }
};

export const getProductionOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.productionOrder.findUnique({
      where: { id },
      include: {
        workCenter: true,
        records: {
          include: {
            materialUsage: {
              include: {
                material: true
              }
            },
            machineUsage: {
              include: {
                machine: true
              }
            },
            qualityMetrics: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Production order not found' });
    }

    return res.json(order);
  } catch (error) {
    logger.error('Error fetching production order:', error);
    return res.status(500).json({ error: 'Failed to fetch production order' });
  }
};

export const createProductionOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    
    // Generate order number if not provided
    if (!orderData.orderNumber) {
      const count = await prisma.productionOrder.count();
      orderData.orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    }

    const order = await prisma.productionOrder.create({
      data: orderData,
      include: {
        workCenter: true
      }
    });

    res.status(201).json(order);
  } catch (error) {
    logger.error('Error creating production order:', error);
    res.status(500).json({ error: 'Failed to create production order' });
  }
};

export const updateProductionOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order = await prisma.productionOrder.update({
      where: { id },
      data: updateData,
      include: {
        workCenter: true
      }
    });

    res.json(order);
  } catch (error) {
    logger.error('Error updating production order:', error);
    res.status(500).json({ error: 'Failed to update production order' });
  }
};

export const updateProductionOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.productionOrder.update({
      where: { id },
      data: { status },
      include: {
        workCenter: true
      }
    });

    res.json(order);
  } catch (error) {
    logger.error('Error updating production order status:', error);
    res.status(500).json({ error: 'Failed to update production order status' });
  }
};

export const deleteProductionOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.productionOrder.delete({
      where: { id }
    });

    res.json({ message: 'Production order deleted successfully' });
  } catch (error) {
    logger.error('Error deleting production order:', error);
    res.status(500).json({ error: 'Failed to delete production order' });
  }
};

// Production Records
export const getProductionRecords = async (req: Request, res: Response) => {
  try {
    const records = await prisma.productionRecord.findMany({
      include: {
        productionOrder: {
          select: {
            orderNumber: true,
            productName: true
          }
        },
        materialUsage: {
          include: {
            material: true
          }
        },
        machineUsage: {
          include: {
            machine: true
          }
        },
        qualityMetrics: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(records);
  } catch (error) {
    logger.error('Error fetching production records:', error);
    res.status(500).json({ error: 'Failed to fetch production records' });
  }
};

export const getProductionRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await prisma.productionRecord.findUnique({
      where: { id },
      include: {
        productionOrder: true,
        materialUsage: {
          include: {
            material: true
          }
        },
        machineUsage: {
          include: {
            machine: true
          }
        },
        qualityMetrics: true
      }
    });

    if (!record) {
      return res.status(404).json({ error: 'Production record not found' });
    }

    return res.json(record);
  } catch (error) {
    logger.error('Error fetching production record:', error);
    return res.status(500).json({ error: 'Failed to fetch production record' });
  }
};

export const createProductionRecord = async (req: Request, res: Response) => {
  try {
    const recordData = req.body;
    
    // Calculate duration
    const startTime = new Date(recordData.startTime);
    const endTime = new Date(recordData.endTime);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create production record
      const record = await tx.productionRecord.create({
        data: {
          productionOrderId: recordData.productionOrderId,
          batchNumber: recordData.batchNumber,
          quantityPlanned: recordData.quantityProduced, // Using produced as planned for now
          quantityProduced: recordData.quantityProduced,
          quantityRejected: recordData.quantityRejected,
          quantityAccepted: recordData.quantityProduced - recordData.quantityRejected,
          startTime: startTime,
          endTime: endTime,
          duration,
          workCenter: recordData.workCenter,
          shift: recordData.shift,
          operatorId: recordData.operatorId,
          operatorName: recordData.operatorId, // Using ID as name for now
          supervisorId: recordData.supervisorId,
          supervisorName: recordData.supervisorId, // Using ID as name for now
          notes: recordData.notes,
          productionOrder: {
            connect: { id: recordData.productionOrderId }
          }
        },
        include: {
          productionOrder: {
            select: {
              orderNumber: true,
              productName: true
            }
          }
        }
      });

      // Handle material usage and deduct from stock
      if (recordData.materialsUsed && recordData.materialsUsed.length > 0) {
        for (const materialUsage of recordData.materialsUsed) {
          if (materialUsage.materialId && materialUsage.quantityUsed > 0) {
            // Get material details for cost calculation
            const material = await tx.rawMaterial.findUnique({
              where: { id: materialUsage.materialId }
            });

            if (material) {
              const totalUsed = materialUsage.quantityUsed + (materialUsage.wastage || 0);
              const totalCost = totalUsed * Number(material.unitCost);

              // Create material usage record
              await tx.productionMaterialUsage.create({
                data: {
                  productionRecordId: record.id,
                  materialId: materialUsage.materialId,
                  quantityUsed: materialUsage.quantityUsed,
                  unit: material.unit,
                  unitCost: material.unitCost,
                  totalCost: totalCost,
                  wastage: materialUsage.wastage || 0,
                  wastagePercentage: materialUsage.quantityUsed > 0 ? 
                    ((materialUsage.wastage || 0) / materialUsage.quantityUsed) * 100 : 0
                }
              });
            }

            // Deduct quantity from raw material stock
            const totalUsed = materialUsage.quantityUsed + (materialUsage.wastage || 0);
            await tx.rawMaterial.update({
              where: { id: materialUsage.materialId },
              data: {
                currentStock: {
                  decrement: totalUsed
                }
              }
            });

            // Create raw material transaction record
            if (material) {
              await tx.rawMaterialTransaction.create({
                data: {
                  materialId: materialUsage.materialId,
                  transactionType: 'consumption',
                  quantity: totalUsed,
                  unitCost: material.unitCost,
                  totalCost: totalUsed * Number(material.unitCost),
                  referenceNumber: record.batchNumber,
                  referenceType: 'production_order',
                  batchNumber: record.batchNumber,
                  createdBy: recordData.operatorId
                }
              });
            }
          }
        }
      }

      // Handle quality metrics
      if (recordData.qualityMetrics && recordData.qualityMetrics.length > 0) {
        for (const metric of recordData.qualityMetrics) {
          await tx.qualityMetric.create({
            data: {
              productionRecordId: record.id,
              metricName: metric.metricName,
              targetValue: 0, // Default target value
              actualValue: metric.actualValue,
              unit: 'unit', // Default unit
              tolerance: 0, // Default tolerance
              passed: true, // Default to passed
              notes: metric.notes
            }
          });
        }
      }

      return record;
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating production record:', error);
    res.status(500).json({ error: 'Failed to create production record' });
  }
};

// Work Centers
export const getWorkCenters = async (req: Request, res: Response) => {
  try {
    const workCenters = await prisma.workCenter.findMany({
      include: {
        machines: true,
        _count: {
          select: {
            orders: true,
            schedules: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(workCenters);
  } catch (error) {
    logger.error('Error fetching work centers:', error);
    res.status(500).json({ error: 'Failed to fetch work centers' });
  }
};

export const createWorkCenter = async (req: Request, res: Response) => {
  try {
    const workCenterData = req.body;
    const workCenter = await prisma.workCenter.create({
      data: workCenterData,
      include: {
        machines: true
      }
    });

    res.status(201).json(workCenter);
  } catch (error) {
    logger.error('Error creating work center:', error);
    res.status(500).json({ error: 'Failed to create work center' });
  }
};

export const updateWorkCenter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const workCenter = await prisma.workCenter.update({
      where: { id },
      data: updateData,
      include: {
        machines: true
      }
    });

    res.json(workCenter);
  } catch (error) {
    logger.error('Error updating work center:', error);
    res.status(500).json({ error: 'Failed to update work center' });
  }
};

export const deleteWorkCenter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.workCenter.delete({
      where: { id }
    });

    res.json({ message: 'Work center deleted successfully' });
  } catch (error) {
    logger.error('Error deleting work center:', error);
    res.status(500).json({ error: 'Failed to delete work center' });
  }
};

// Machine Management
export const getMachines = async (req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany({
      include: {
        workCenter: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(machines);
  } catch (error) {
    logger.error('Error fetching machines:', error);
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
};

export const createMachine = async (req: Request, res: Response) => {
  try {
    const machineData = req.body;
    const machine = await prisma.machine.create({
      data: machineData,
      include: {
        workCenter: true
      }
    });

    res.status(201).json(machine);
  } catch (error) {
    logger.error('Error creating machine:', error);
    res.status(500).json({ error: 'Failed to create machine' });
  }
};

export const updateMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const machine = await prisma.machine.update({
      where: { id },
      data: updateData,
      include: {
        workCenter: true
      }
    });

    res.json(machine);
  } catch (error) {
    logger.error('Error updating machine:', error);
    res.status(500).json({ error: 'Failed to update machine' });
  }
};

export const deleteMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.machine.delete({
      where: { id }
    });

    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    logger.error('Error deleting machine:', error);
    res.status(500).json({ error: 'Failed to delete machine' });
  }
};

// Production Schedules
export const getProductionSchedules = async (req: Request, res: Response) => {
  try {
    const { workCenterId, date } = req.query;
    
    const where: any = {};
    if (workCenterId) where.workCenterId = workCenterId as string;
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.scheduleDate = {
        gte: startDate,
        lt: endDate
      };
    }

    const schedules = await prisma.productionSchedule.findMany({
      where,
      include: {
        workCenter: true,
        scheduledOrders: {
          include: {
            productionOrder: {
              select: {
                orderNumber: true,
                productName: true,
                quantity: true
              }
            }
          }
        }
      },
      orderBy: { scheduleDate: 'asc' }
    });

    res.json(schedules);
  } catch (error) {
    logger.error('Error fetching production schedules:', error);
    res.status(500).json({ error: 'Failed to fetch production schedules' });
  }
};

// Analytics and KPIs
export const getProductionKPIs = async (req: Request, res: Response) => {
  try {
    const { period = 'monthly' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get production data for the period
    const [orders, records, workCenters] = await Promise.all([
      prisma.productionOrder.findMany({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.productionRecord.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          materialUsage: true,
          machineUsage: true
        }
      }),
      prisma.workCenter.findMany({
        include: {
          machines: true
        }
      })
    ]);

    // Calculate KPIs
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalUnitsProduced = records.reduce((sum, r) => sum + r.quantityProduced, 0);
    const totalUnitsRejected = records.reduce((sum, r) => sum + r.quantityRejected, 0);
    const overallEfficiency = totalUnitsProduced > 0 ? 
      ((totalUnitsProduced - totalUnitsRejected) / totalUnitsProduced) * 100 : 0;

    // Calculate work center efficiency
    const workCenterEfficiency = workCenters.map(wc => {
      const wcRecords = records.filter(r => r.workCenter === wc.name);
      const wcUnitsProduced = wcRecords.reduce((sum, r) => sum + r.quantityProduced, 0);
      const wcUnitsRejected = wcRecords.reduce((sum, r) => sum + r.quantityRejected, 0);
      const efficiency = wcUnitsProduced > 0 ? 
        ((wcUnitsProduced - wcUnitsRejected) / wcUnitsProduced) * 100 : 0;
      
      return {
        workCenterId: wc.id,
        workCenterName: wc.name,
        efficiency: Math.round(efficiency * 100) / 100,
        plannedHours: wcRecords.length * 8, // Assuming 8 hours per record
        actualHours: wcRecords.reduce((sum, r) => sum + r.duration, 0),
        utilization: wcRecords.length > 0 ? 
          (wcRecords.reduce((sum, r) => sum + r.duration, 0) / (wcRecords.length * 8)) * 100 : 0
      };
    });

    // Calculate machine efficiency
    const machineEfficiency = workCenters.flatMap(wc => 
      wc.machines.map(machine => {
        const machineUsage = records.flatMap(r => r.machineUsage || [])
          .filter(mu => mu.machineId === machine.id);
        const totalUptime = machineUsage.reduce((sum, mu) => sum + mu.duration, 0);
        const efficiency = totalUptime > 0 ? (totalUptime / (machineUsage.length * 8)) * 100 : 0;
        
        return {
          machineId: machine.id,
          machineName: machine.name,
          efficiency: Math.round(efficiency * 100) / 100,
          uptime: Math.round(efficiency * 100) / 100,
          downtime: Math.round((100 - efficiency) * 100) / 100,
          maintenanceHours: 0 // This would need to be calculated from maintenance records
        };
      })
    );

    // Calculate quality metrics
    const qualityPassed = records.filter(r => r.qualityPassed).length;
    const firstPassYield = records.length > 0 ? (qualityPassed / records.length) * 100 : 0;
    const defectRate = totalUnitsProduced > 0 ? (totalUnitsRejected / totalUnitsProduced) * 100 : 0;

    // Calculate costs
    const materialCosts = records.reduce((sum, r) => 
      sum + r.materialUsage.reduce((msum, mu) => msum + Number(mu.totalCost), 0), 0
    );

    const kpis = {
      period: {
        fromDate: startDate,
        toDate: now
      },
      efficiency: {
        overallEfficiency: Math.round(overallEfficiency * 100) / 100,
        workCenterEfficiency,
        machineEfficiency
      },
      quality: {
        firstPassYield: Math.round(firstPassYield * 100) / 100,
        defectRate: Math.round(defectRate * 100) / 100,
        reworkRate: 0, // This would need to be calculated from rework records
        customerComplaints: 0 // This would need to be tracked separately
      },
      productivity: {
        unitsProduced: totalUnitsProduced,
        plannedUnits: orders.reduce((sum, o) => sum + o.quantity, 0),
        productivityRate: Math.round(overallEfficiency * 100) / 100,
        overtimeHours: 0, // This would need to be calculated from time records
        utilizationRate: Math.round(overallEfficiency * 100) / 100
      },
      costs: {
        materialCosts,
        laborCosts: 0, // This would need to be calculated from labor records
        overheadCosts: 0, // This would need to be calculated from overhead records
        totalCosts: materialCosts,
        costPerUnit: totalUnitsProduced > 0 ? materialCosts / totalUnitsProduced : 0
      },
      delivery: {
        onTimeDelivery: Math.round(firstPassYield * 100) / 100, // Simplified calculation
        averageLeadTime: 0, // This would need to be calculated from order dates
        scheduleAdherence: Math.round(overallEfficiency * 100) / 100
      }
    };

    res.json(kpis);
  } catch (error) {
    logger.error('Error fetching production KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch production KPIs' });
  }
};

export const getProductionReport = async (req: Request, res: Response) => {
  try {
    const { reportType = 'monthly', fromDate, toDate } = req.query;
    
    const startDate = new Date(fromDate as string);
    const endDate = new Date(toDate as string);
    endDate.setHours(23, 59, 59, 999);

    // Get production data for the period
    const [orders, records, workCenters] = await Promise.all([
      prisma.productionOrder.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.productionRecord.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        },
        include: {
          materialUsage: {
            include: {
              material: true
            }
          },
          machineUsage: {
            include: {
              machine: true
            }
          },
          qualityMetrics: true
        }
      }),
      prisma.workCenter.findMany({
        include: {
          machines: true
        }
      })
    ]);

    // Calculate summary
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;
    const totalUnitsProduced = records.reduce((sum, r) => sum + r.quantityProduced, 0);
    const totalUnitsRejected = records.reduce((sum, r) => sum + r.quantityRejected, 0);
    const overallEfficiency = totalUnitsProduced > 0 ? 
      ((totalUnitsProduced - totalUnitsRejected) / totalUnitsProduced) * 100 : 0;

    // Calculate work center performance
    const workCenterPerformance = workCenters.map(wc => {
      const wcRecords = records.filter(r => r.workCenter === wc.name);
      const wcOrders = orders.filter(o => o.workCenterId === wc.id);
      const wcUnitsProduced = wcRecords.reduce((sum, r) => sum + r.quantityProduced, 0);
      const wcUnitsRejected = wcRecords.reduce((sum, r) => sum + r.quantityRejected, 0);
      const efficiency = wcUnitsProduced > 0 ? 
        ((wcUnitsProduced - wcUnitsRejected) / wcUnitsProduced) * 100 : 0;
      
      const materialCosts = wcRecords.reduce((sum, r) => 
        sum + r.materialUsage.reduce((msum, mu) => msum + Number(mu.totalCost), 0), 0
      );

      return {
        workCenterId: wc.id,
        workCenterName: wc.name,
        ordersCompleted: wcOrders.filter(o => o.status === 'completed').length,
        unitsProduced: wcUnitsProduced,
        efficiency: Math.round(efficiency * 100) / 100,
        utilization: wcRecords.length > 0 ? 
          (wcRecords.reduce((sum, r) => sum + r.duration, 0) / (wcRecords.length * 8)) * 100 : 0,
        downtime: 0, // This would need to be calculated from downtime records
        costs: materialCosts
      };
    });

    // Calculate product performance
    const productPerformance = orders.reduce((acc, order) => {
      const orderRecords = records.filter(r => r.productionOrderId === order.id);
      const unitsProduced = orderRecords.reduce((sum, r) => sum + r.quantityProduced, 0);
      const unitsRejected = orderRecords.reduce((sum, r) => sum + r.quantityRejected, 0);
      const yieldRate = unitsProduced > 0 ? ((unitsProduced - unitsRejected) / unitsProduced) * 100 : 0;
      
      const existing = acc.find(p => p.productId === order.productId);
      if (existing) {
        existing.ordersCompleted += order.status === 'completed' ? 1 : 0;
        existing.unitsProduced += unitsProduced;
        existing.unitsRejected += unitsRejected;
        existing.yield = existing.unitsProduced > 0 ? 
          ((existing.unitsProduced - existing.unitsRejected) / existing.unitsProduced) * 100 : 0;
      } else {
        acc.push({
          productId: order.productId,
          productName: order.productName,
          ordersCompleted: order.status === 'completed' ? 1 : 0,
          unitsProduced,
          unitsRejected,
          yield: Math.round(yieldRate * 100) / 100,
          averageCycleTime: orderRecords.length > 0 ? 
            orderRecords.reduce((sum, r) => sum + r.duration, 0) / orderRecords.length : 0,
          costs: orderRecords.reduce((sum, r) => 
            sum + r.materialUsage.reduce((msum, mu) => msum + Number(mu.totalCost), 0), 0
          )
        });
      }
      return acc;
    }, [] as any[]);

    // Calculate quality metrics
    const qualityMetrics = records.flatMap(r => r.qualityMetrics).reduce((acc, metric) => {
      const existing = acc.find(m => m.metric === metric.metricName);
      if (existing) {
        existing.actual = (existing.actual + metric.actualValue) / 2; // Average
      } else {
        acc.push({
          metric: metric.metricName,
          target: metric.targetValue,
          actual: metric.actualValue,
          variance: metric.actualValue - metric.targetValue,
          status: metric.passed ? 'pass' : 'fail'
        });
      }
      return acc;
    }, [] as any[]);

    // Calculate material usage
    const materialUsage = records.flatMap(r => r.materialUsage).reduce((acc, usage) => {
      const existing = acc.find(m => m.materialId === usage.materialId);
      if (existing) {
        existing.actualQuantity += usage.quantityUsed;
        existing.wastage += usage.wastage;
        existing.cost += Number(usage.totalCost);
      } else {
        acc.push({
          materialId: usage.materialId,
          materialName: usage.material.materialName,
          plannedQuantity: usage.quantityUsed, // Simplified - would need BOM data
          actualQuantity: usage.quantityUsed,
          variance: 0,
          wastage: usage.wastage,
          cost: Number(usage.totalCost)
        });
      }
      return acc;
    }, [] as any[]);

    const report = {
      reportType,
      period: {
        fromDate: startDate,
        toDate: endDate
      },
      summary: {
        totalOrders,
        completedOrders,
        inProgressOrders,
        totalUnitsProduced,
        totalUnitsRejected,
        overallEfficiency: Math.round(overallEfficiency * 100) / 100,
        totalCosts: workCenterPerformance.reduce((sum, wc) => sum + wc.costs, 0)
      },
      workCenterPerformance,
      productPerformance,
      qualityMetrics,
      materialUsage
    };

    res.json(report);
  } catch (error) {
    logger.error('Error generating production report:', error);
    res.status(500).json({ error: 'Failed to generate production report' });
  }
};

export const exportProductionReport = async (req: Request, res: Response) => {
  try {
    // This would generate a PDF or Excel file
    // For now, return the report data as JSON
    const reportData = await getProductionReport(req, res);
    res.json({ message: 'Export functionality would be implemented here', data: reportData });
  } catch (error) {
    logger.error('Error exporting production report:', error);
    res.status(500).json({ error: 'Failed to export production report' });
  }
};

// Production Chart Controllers
export const getProductionCharts = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = req.query;
    
    const where: any = {};
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = new Date(fromDate as string);
      if (toDate) where.date.lte = new Date(toDate as string);
    }

    const charts = await prisma.productionChart.findMany({
      where,
      include: {
        ingredients: true,
        outputs: true,
        subCharts: {
          include: {
            outputs: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(charts);
  } catch (error) {
    logger.error('Error fetching production charts:', error);
    res.status(500).json({ error: 'Failed to fetch production charts' });
  }
};

export const getProductionChartById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const chart = await prisma.productionChart.findUnique({
      where: { id },
      include: {
        ingredients: true,
        outputs: true,
        subCharts: {
          include: {
            outputs: true
          }
        }
      }
    });

    if (!chart) {
      res.status(404).json({ error: 'Production chart not found' });
      return;
    }

    res.json(chart);
    return;
  } catch (error) {
    logger.error('Error fetching production chart:', error);
    res.status(500).json({ error: 'Failed to fetch production chart' });
    return;
  }
};

export const createProductionChart = async (req: Request, res: Response) => {
  try {
    const { date, dayOfWeek, ingredients, outputs, subCharts, notes } = req.body;
    const userId = (req as any).user?.id || 'system';

    // Create chart with ingredients and outputs first
    const chart = await prisma.productionChart.create({
      data: {
        date: new Date(date),
        dayOfWeek,
        notes,
        createdBy: userId,
        ingredients: {
          create: ingredients.map((ing: any) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category
          }))
        },
        outputs: {
          create: outputs.map((out: any) => ({
            productName: out.productName,
            quantity: out.quantity,
            unit: out.unit,
            batchNumber: out.batchNumber
          }))
        }
      },
      include: {
        ingredients: true,
        outputs: true,
        subCharts: {
          include: {
            outputs: true
          }
        }
      }
    });

    // Create subCharts separately after ingredients exist
    if (subCharts && subCharts.length > 0) {
      // Create a map of ingredient names to IDs for lookup
      const ingredientMap = new Map(chart.ingredients.map(ing => [ing.name, ing.id]));
      
      for (const sub of subCharts) {
        // Find the ingredient ID by name, or use the first ingredient as fallback
        const ingredientId = ingredientMap.get(sub.ingredientName) || chart.ingredients[0]?.id;
        
        if (ingredientId) {
          await prisma.productionSubChart.create({
            data: {
              productionChartId: chart.id,
              ingredientId: ingredientId,
              ingredientName: sub.ingredientName,
              notes: sub.notes,
              outputs: {
                create: sub.outputs.map((out: any) => ({
                  productName: out.productName,
                  quantity: out.quantity,
                  unit: out.unit,
                  batchNumber: out.batchNumber
                }))
              }
            }
          });
        }
      }

      // Fetch the updated chart with subCharts
      const updatedChart = await prisma.productionChart.findUnique({
        where: { id: chart.id },
        include: {
          ingredients: true,
          outputs: true,
          subCharts: {
            include: {
              outputs: true
            }
          }
        }
      });

      res.status(201).json(updatedChart);
      return;
    }

    res.status(201).json(chart);
  } catch (error) {
    logger.error('Error creating production chart:', error);
    res.status(500).json({ error: 'Failed to create production chart' });
  }
};

export const updateProductionChart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, dayOfWeek, ingredients, outputs, subCharts, notes } = req.body;

    // Delete existing related data
    await prisma.productionSubChartOutput.deleteMany({
      where: {
        subChart: {
          productionChartId: id
        }
      }
    });
    await prisma.productionSubChart.deleteMany({
      where: { productionChartId: id }
    });
    await prisma.productionChartOutput.deleteMany({
      where: { productionChartId: id }
    });
    await prisma.productionChartIngredient.deleteMany({
      where: { productionChartId: id }
    });

    // Update the chart with new data
    const chart = await prisma.productionChart.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        dayOfWeek,
        notes,
        ingredients: {
          create: ingredients?.map((ing: any) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category
          }))
        },
        outputs: {
          create: outputs?.map((out: any) => ({
            productName: out.productName,
            quantity: out.quantity,
            unit: out.unit,
            batchNumber: out.batchNumber
          }))
        },
        subCharts: {
          create: subCharts?.map((sub: any) => ({
            ingredientId: sub.ingredientId,
            ingredientName: sub.ingredientName,
            notes: sub.notes,
            outputs: {
              create: sub.outputs.map((out: any) => ({
                productName: out.productName,
                quantity: out.quantity,
                unit: out.unit,
                batchNumber: out.batchNumber
              }))
            }
          })) || []
        }
      },
      include: {
        ingredients: true,
        outputs: true,
        subCharts: {
          include: {
            outputs: true
          }
        }
      }
    });

    res.json(chart);
  } catch (error) {
    logger.error('Error updating production chart:', error);
    res.status(500).json({ error: 'Failed to update production chart' });
  }
};

export const deleteProductionChart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.productionChart.delete({
      where: { id }
    });

    res.json({ message: 'Production chart deleted successfully' });
  } catch (error) {
    logger.error('Error deleting production chart:', error);
    res.status(500).json({ error: 'Failed to delete production chart' });
  }
};

export const getProductionChartSummary = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = req.query;
    
    const where: any = {};
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = new Date(fromDate as string);
      if (toDate) where.date.lte = new Date(toDate as string);
    }

    const charts = await prisma.productionChart.findMany({
      where,
      include: {
        ingredients: true,
        outputs: true
      }
    });

    // Calculate summary statistics
    const totalIngredients = charts.reduce((sum, chart) => sum + chart.ingredients.length, 0);
    const totalOutputs = charts.reduce((sum, chart) => sum + chart.outputs.length, 0);
    
    const ingredientUsage = charts.flatMap(c => c.ingredients).reduce((acc, ing) => {
      const key = `${ing.name} (${ing.unit})`;
      if (!acc[key]) {
        acc[key] = { name: ing.name, unit: ing.unit, totalQuantity: 0 };
      }
      acc[key].totalQuantity += ing.quantity;
      return acc;
    }, {} as Record<string, any>);

    const outputSummary = charts.flatMap(c => c.outputs).reduce((acc, out) => {
      const key = `${out.productName} (${out.unit})`;
      if (!acc[key]) {
        acc[key] = { productName: out.productName, unit: out.unit, totalQuantity: 0 };
      }
      acc[key].totalQuantity += out.quantity;
      return acc;
    }, {} as Record<string, any>);

    const summary = {
      totalCharts: charts.length,
      totalIngredients,
      totalOutputs,
      dateRange: {
        from: fromDate || null,
        to: toDate || null
      },
      ingredientUsage: Object.values(ingredientUsage),
      outputSummary: Object.values(outputSummary)
    };

    res.json(summary);
  } catch (error) {
    logger.error('Error fetching production chart summary:', error);
    res.status(500).json({ error: 'Failed to fetch production chart summary' });
  }
};

// Raw Material Wastage Management

export const createWastageEntry = async (req: Request, res: Response) => {
  try {
    const {
      materialId,
      quantity,
      reason,
      notes,
      batchNumber,
      location,
      wastageDate
    } = req.body;

    const userId = (req as any).user?.id || 'system';
    const userName = (req as any).user?.fullName || (req as any).user?.username || 'System';

    // Validate material exists
    const material = await prisma.rawMaterial.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      res.status(404).json({ error: 'Raw material not found' });
      return;
    }

    // Check if enough stock is available
    if (material.currentStock < quantity) {
      res.status(400).json({
        error: 'Insufficient stock',
        available: material.currentStock,
        requested: quantity
      });
      return;
    }

    const unitCost = material.unitCost;
    const totalCost = Number(unitCost) * quantity;

    // Create wastage entry and update stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create wastage entry
      const wastageEntry = await tx.rawMaterialWastage.create({
        data: {
          materialId,
          quantity,
          unit: material.unit,
          unitCost,
          totalCost,
          reason,
          notes,
          batchNumber,
          location,
          wastageDate: wastageDate ? new Date(wastageDate) : new Date(),
          createdBy: userId,
          createdByName: userName
        }
      });

      // Update raw material stock
      await tx.rawMaterial.update({
        where: { id: materialId },
        data: {
          currentStock: {
            decrement: quantity
          }
        }
      });

      // Create transaction record
      await tx.rawMaterialTransaction.create({
        data: {
          materialId,
          transactionType: 'wastage',
          quantity: -quantity,
          unitCost,
          totalCost,
          referenceNumber: wastageEntry.id,
          referenceType: 'wastage',
          batchNumber,
          location,
          createdBy: userId
        }
      });

      return wastageEntry;
    });

    res.status(201).json({
      message: 'Wastage entry created successfully',
      wastage: result
    });
  } catch (error) {
    logger.error('Error creating wastage entry:', error);
    res.status(500).json({ error: 'Failed to create wastage entry' });
  }
};

export const getWastageEntries = async (req: Request, res: Response) => {
  try {
    const {
      materialId,
      fromDate,
      toDate,
      reason,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (materialId) {
      where.materialId = materialId;
    }

    if (reason) {
      where.reason = reason;
    }

    if (fromDate || toDate) {
      where.wastageDate = {};
      if (fromDate) {
        where.wastageDate.gte = new Date(fromDate as string);
      }
      if (toDate) {
        where.wastageDate.lte = new Date(toDate as string);
      }
    }

    const [wastageEntries, total] = await Promise.all([
      prisma.rawMaterialWastage.findMany({
        where,
        include: {
          material: {
            select: {
              materialName: true,
              materialCode: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          wastageDate: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.rawMaterialWastage.count({ where })
    ]);

    res.json({
      wastageEntries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Error fetching wastage entries:', error);
    res.status(500).json({ error: 'Failed to fetch wastage entries' });
  }
};

export const getWastageEntryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const wastageEntry = await prisma.rawMaterialWastage.findUnique({
      where: { id },
      include: {
        material: {
          select: {
            materialName: true,
            materialCode: true,
            unit: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!wastageEntry) {
      res.status(404).json({ error: 'Wastage entry not found' });
      return;
    }

    res.json(wastageEntry);
  } catch (error) {
    logger.error('Error fetching wastage entry:', error);
    res.status(500).json({ error: 'Failed to fetch wastage entry' });
  }
};

export const updateWastageEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, notes, wastageDate } = req.body;

    const wastageEntry = await prisma.rawMaterialWastage.findUnique({
      where: { id }
    });

    if (!wastageEntry) {
      res.status(404).json({ error: 'Wastage entry not found' });
      return;
    }

    const updated = await prisma.rawMaterialWastage.update({
      where: { id },
      data: {
        reason,
        notes,
        wastageDate: wastageDate ? new Date(wastageDate) : undefined
      },
      include: {
        material: {
          select: {
            materialName: true,
            materialCode: true
          }
        }
      }
    });

    res.json({
      message: 'Wastage entry updated successfully',
      wastage: updated
    });
  } catch (error) {
    logger.error('Error updating wastage entry:', error);
    res.status(500).json({ error: 'Failed to update wastage entry' });
  }
};

export const deleteWastageEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const wastageEntry = await prisma.rawMaterialWastage.findUnique({
      where: { id }
    });

    if (!wastageEntry) {
      res.status(404).json({ error: 'Wastage entry not found' });
      return;
    }

    // Restore stock and delete entry in a transaction
    await prisma.$transaction(async (tx) => {
      // Restore raw material stock
      await tx.rawMaterial.update({
        where: { id: wastageEntry.materialId },
        data: {
          currentStock: {
            increment: wastageEntry.quantity
          }
        }
      });

      // Delete related transaction
      await tx.rawMaterialTransaction.deleteMany({
        where: {
          referenceNumber: id,
          referenceType: 'wastage'
        }
      });

      // Delete wastage entry
      await tx.rawMaterialWastage.delete({
        where: { id }
      });
    });

    res.json({
      message: 'Wastage entry deleted successfully and stock restored'
    });
  } catch (error) {
    logger.error('Error deleting wastage entry:', error);
    res.status(500).json({ error: 'Failed to delete wastage entry' });
  }
};

export const getWastageSummary = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, materialId, categoryId } = req.query;

    const where: any = {};

    if (materialId) {
      where.materialId = materialId;
    }

    if (fromDate || toDate) {
      where.wastageDate = {};
      if (fromDate) {
        where.wastageDate.gte = new Date(fromDate as string);
      }
      if (toDate) {
        where.wastageDate.lte = new Date(toDate as string);
      }
    }

    // If category filter is applied, we need to filter by material's category
    let categoryFilter = {};
    if (categoryId) {
      categoryFilter = {
        material: {
          categoryId: categoryId as string
        }
      };
    }

    const wastageEntries = await prisma.rawMaterialWastage.findMany({
      where: {
        ...where,
        ...categoryFilter
      },
      include: {
        material: {
          select: {
            materialName: true,
            materialCode: true,
            categoryId: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Calculate summary statistics
    const summary = {
      totalWastageQuantity: 0,
      totalWastageCost: 0,
      totalEntries: wastageEntries.length,
      byMaterial: {} as any,
      byReason: {} as any,
      byCategory: {} as any
    };

    wastageEntries.forEach(entry => {
      summary.totalWastageQuantity += entry.quantity;
      summary.totalWastageCost += Number(entry.totalCost);

      // By material
      const materialKey = entry.materialId;
      if (!summary.byMaterial[materialKey]) {
        summary.byMaterial[materialKey] = {
          materialName: entry.material.materialName,
          materialCode: entry.material.materialCode,
          totalQuantity: 0,
          totalCost: 0,
          entries: 0
        };
      }
      summary.byMaterial[materialKey].totalQuantity += entry.quantity;
      summary.byMaterial[materialKey].totalCost += Number(entry.totalCost);
      summary.byMaterial[materialKey].entries += 1;

      // By reason
      if (!summary.byReason[entry.reason]) {
        summary.byReason[entry.reason] = {
          quantity: 0,
          cost: 0,
          entries: 0
        };
      }
      summary.byReason[entry.reason].quantity += entry.quantity;
      summary.byReason[entry.reason].cost += Number(entry.totalCost);
      summary.byReason[entry.reason].entries += 1;

      // By category
      const categoryName = entry.material.category?.name || 'Uncategorized';
      if (!summary.byCategory[categoryName]) {
        summary.byCategory[categoryName] = {
          quantity: 0,
          cost: 0,
          entries: 0
        };
      }
      summary.byCategory[categoryName].quantity += entry.quantity;
      summary.byCategory[categoryName].cost += Number(entry.totalCost);
      summary.byCategory[categoryName].entries += 1;
    });

    res.json({
      summary,
      dateRange: {
        from: fromDate || null,
        to: toDate || null
      }
    });
  } catch (error) {
    logger.error('Error fetching wastage summary:', error);
    res.status(500).json({ error: 'Failed to fetch wastage summary' });
  }
};

export const getWastageReasons = async (req: Request, res: Response) => {
  try {
    // Get unique reasons from existing entries
    const reasons = await prisma.rawMaterialWastage.groupBy({
      by: ['reason'],
      _count: {
        reason: true
      }
    });

    // Common wastage reasons
    const commonReasons = [
      'Expired',
      'Damaged',
      'Spoilage',
      'Quality Issue',
      'Pest Infestation',
      'Storage Loss',
      'Measurement Error',
      'Production Waste',
      'Theft',
      'Other'
    ];

    const existingReasons = reasons.map(r => r.reason);
    const allReasons = [...new Set([...commonReasons, ...existingReasons])];

    res.json({
      reasons: allReasons,
      usage: reasons.map(r => ({
        reason: r.reason,
        count: r._count.reason
      }))
    });
  } catch (error) {
    logger.error('Error fetching wastage reasons:', error);
    res.status(500).json({ error: 'Failed to fetch wastage reasons' });
  }
};
