"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportProductionReport = exports.getProductionReport = exports.getProductionKPIs = exports.getProductionSchedules = exports.deleteMachine = exports.updateMachine = exports.createMachine = exports.getMachines = exports.deleteWorkCenter = exports.updateWorkCenter = exports.createWorkCenter = exports.getWorkCenters = exports.createProductionRecord = exports.getProductionRecordById = exports.getProductionRecords = exports.deleteProductionOrder = exports.updateProductionOrderStatus = exports.updateProductionOrder = exports.createProductionOrder = exports.getProductionOrderById = exports.getProductionOrders = exports.getRawMaterialTransactions = exports.deleteRawMaterialCategory = exports.updateRawMaterialCategory = exports.createRawMaterialCategory = exports.getRawMaterialCategories = exports.deleteRawMaterial = exports.updateRawMaterial = exports.createRawMaterial = exports.getRawMaterialById = exports.getRawMaterials = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
const getRawMaterials = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error fetching raw materials:', error);
        res.status(500).json({ error: 'Failed to fetch raw materials' });
    }
};
exports.getRawMaterials = getRawMaterials;
const getRawMaterialById = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error fetching raw material:', error);
        return res.status(500).json({ error: 'Failed to fetch raw material' });
    }
};
exports.getRawMaterialById = getRawMaterialById;
const createRawMaterial = async (req, res) => {
    try {
        const materialData = req.body;
        if (!materialData.materialCode) {
            const count = await prisma.rawMaterial.count();
            materialData.materialCode = `RM${String(count + 1).padStart(3, '0')}`;
        }
        let categoryId = materialData.categoryId;
        if (materialData.category && !categoryId) {
            const category = await prisma.rawMaterialCategory.findFirst({
                where: { name: materialData.category }
            });
            if (category) {
                categoryId = category.id;
            }
            else {
                return res.status(400).json({ error: 'Category not found' });
            }
        }
        const { category, ...createData } = materialData;
        createData.categoryId = categoryId;
        const material = await prisma.rawMaterial.create({
            data: createData,
            include: {
                category: true
            }
        });
        return res.status(201).json(material);
    }
    catch (error) {
        logger_1.default.error('Error creating raw material:', error);
        return res.status(500).json({ error: 'Failed to create raw material' });
    }
};
exports.createRawMaterial = createRawMaterial;
const updateRawMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        let categoryId = updateData.categoryId;
        if (updateData.category && !categoryId) {
            const category = await prisma.rawMaterialCategory.findFirst({
                where: { name: updateData.category }
            });
            if (category) {
                categoryId = category.id;
            }
            else {
                return res.status(400).json({ error: 'Category not found' });
            }
        }
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
    }
    catch (error) {
        logger_1.default.error('Error updating raw material:', error);
        return res.status(500).json({ error: 'Failed to update raw material' });
    }
};
exports.updateRawMaterial = updateRawMaterial;
const deleteRawMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.rawMaterial.delete({
            where: { id }
        });
        res.json({ message: 'Raw material deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Error deleting raw material:', error);
        res.status(500).json({ error: 'Failed to delete raw material' });
    }
};
exports.deleteRawMaterial = deleteRawMaterial;
const getRawMaterialCategories = async (req, res) => {
    try {
        const categories = await prisma.rawMaterialCategory.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (error) {
        logger_1.default.error('Error fetching raw material categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
exports.getRawMaterialCategories = getRawMaterialCategories;
const createRawMaterialCategory = async (req, res) => {
    try {
        const categoryData = req.body;
        const category = await prisma.rawMaterialCategory.create({
            data: categoryData
        });
        res.status(201).json(category);
    }
    catch (error) {
        logger_1.default.error('Error creating raw material category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
};
exports.createRawMaterialCategory = createRawMaterialCategory;
const updateRawMaterialCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const category = await prisma.rawMaterialCategory.update({
            where: { id },
            data: updateData
        });
        res.json(category);
    }
    catch (error) {
        logger_1.default.error('Error updating raw material category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
};
exports.updateRawMaterialCategory = updateRawMaterialCategory;
const deleteRawMaterialCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.rawMaterialCategory.delete({
            where: { id }
        });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Error deleting raw material category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};
exports.deleteRawMaterialCategory = deleteRawMaterialCategory;
const getRawMaterialTransactions = async (req, res) => {
    try {
        const { materialId } = req.query;
        const where = materialId ? { materialId: materialId } : {};
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
    }
    catch (error) {
        logger_1.default.error('Error fetching raw material transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};
exports.getRawMaterialTransactions = getRawMaterialTransactions;
const getProductionOrders = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error fetching production orders:', error);
        res.status(500).json({ error: 'Failed to fetch production orders' });
    }
};
exports.getProductionOrders = getProductionOrders;
const getProductionOrderById = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error fetching production order:', error);
        return res.status(500).json({ error: 'Failed to fetch production order' });
    }
};
exports.getProductionOrderById = getProductionOrderById;
const createProductionOrder = async (req, res) => {
    try {
        const orderData = req.body;
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
    }
    catch (error) {
        logger_1.default.error('Error creating production order:', error);
        res.status(500).json({ error: 'Failed to create production order' });
    }
};
exports.createProductionOrder = createProductionOrder;
const updateProductionOrder = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error updating production order:', error);
        res.status(500).json({ error: 'Failed to update production order' });
    }
};
exports.updateProductionOrder = updateProductionOrder;
const updateProductionOrderStatus = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error updating production order status:', error);
        res.status(500).json({ error: 'Failed to update production order status' });
    }
};
exports.updateProductionOrderStatus = updateProductionOrderStatus;
const deleteProductionOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.productionOrder.delete({
            where: { id }
        });
        res.json({ message: 'Production order deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Error deleting production order:', error);
        res.status(500).json({ error: 'Failed to delete production order' });
    }
};
exports.deleteProductionOrder = deleteProductionOrder;
const getProductionRecords = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error fetching production records:', error);
        res.status(500).json({ error: 'Failed to fetch production records' });
    }
};
exports.getProductionRecords = getProductionRecords;
const getProductionRecordById = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error fetching production record:', error);
        return res.status(500).json({ error: 'Failed to fetch production record' });
    }
};
exports.getProductionRecordById = getProductionRecordById;
const createProductionRecord = async (req, res) => {
    try {
        const recordData = req.body;
        const startTime = new Date(recordData.startTime);
        const endTime = new Date(recordData.endTime);
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const result = await prisma.$transaction(async (tx) => {
            const record = await tx.productionRecord.create({
                data: {
                    productionOrderId: recordData.productionOrderId,
                    batchNumber: recordData.batchNumber,
                    quantityPlanned: recordData.quantityProduced,
                    quantityProduced: recordData.quantityProduced,
                    quantityRejected: recordData.quantityRejected,
                    quantityAccepted: recordData.quantityProduced - recordData.quantityRejected,
                    startTime: startTime,
                    endTime: endTime,
                    duration,
                    workCenter: recordData.workCenter,
                    shift: recordData.shift,
                    operatorId: recordData.operatorId,
                    operatorName: recordData.operatorId,
                    supervisorId: recordData.supervisorId,
                    supervisorName: recordData.supervisorId,
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
            if (recordData.materialsUsed && recordData.materialsUsed.length > 0) {
                for (const materialUsage of recordData.materialsUsed) {
                    if (materialUsage.materialId && materialUsage.quantityUsed > 0) {
                        const material = await tx.rawMaterial.findUnique({
                            where: { id: materialUsage.materialId }
                        });
                        if (material) {
                            const totalUsed = materialUsage.quantityUsed + (materialUsage.wastage || 0);
                            const totalCost = totalUsed * Number(material.unitCost);
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
                        const totalUsed = materialUsage.quantityUsed + (materialUsage.wastage || 0);
                        await tx.rawMaterial.update({
                            where: { id: materialUsage.materialId },
                            data: {
                                currentStock: {
                                    decrement: totalUsed
                                }
                            }
                        });
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
            if (recordData.qualityMetrics && recordData.qualityMetrics.length > 0) {
                for (const metric of recordData.qualityMetrics) {
                    await tx.qualityMetric.create({
                        data: {
                            productionRecordId: record.id,
                            metricName: metric.metricName,
                            targetValue: 0,
                            actualValue: metric.actualValue,
                            unit: 'unit',
                            tolerance: 0,
                            passed: true,
                            notes: metric.notes
                        }
                    });
                }
            }
            return record;
        });
        res.status(201).json(result);
    }
    catch (error) {
        logger_1.default.error('Error creating production record:', error);
        res.status(500).json({ error: 'Failed to create production record' });
    }
};
exports.createProductionRecord = createProductionRecord;
const getWorkCenters = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error fetching work centers:', error);
        res.status(500).json({ error: 'Failed to fetch work centers' });
    }
};
exports.getWorkCenters = getWorkCenters;
const createWorkCenter = async (req, res) => {
    try {
        const workCenterData = req.body;
        const workCenter = await prisma.workCenter.create({
            data: workCenterData,
            include: {
                machines: true
            }
        });
        res.status(201).json(workCenter);
    }
    catch (error) {
        logger_1.default.error('Error creating work center:', error);
        res.status(500).json({ error: 'Failed to create work center' });
    }
};
exports.createWorkCenter = createWorkCenter;
const updateWorkCenter = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error updating work center:', error);
        res.status(500).json({ error: 'Failed to update work center' });
    }
};
exports.updateWorkCenter = updateWorkCenter;
const deleteWorkCenter = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.workCenter.delete({
            where: { id }
        });
        res.json({ message: 'Work center deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Error deleting work center:', error);
        res.status(500).json({ error: 'Failed to delete work center' });
    }
};
exports.deleteWorkCenter = deleteWorkCenter;
const getMachines = async (req, res) => {
    try {
        const machines = await prisma.machine.findMany({
            include: {
                workCenter: true
            },
            orderBy: { name: 'asc' }
        });
        res.json(machines);
    }
    catch (error) {
        logger_1.default.error('Error fetching machines:', error);
        res.status(500).json({ error: 'Failed to fetch machines' });
    }
};
exports.getMachines = getMachines;
const createMachine = async (req, res) => {
    try {
        const machineData = req.body;
        const machine = await prisma.machine.create({
            data: machineData,
            include: {
                workCenter: true
            }
        });
        res.status(201).json(machine);
    }
    catch (error) {
        logger_1.default.error('Error creating machine:', error);
        res.status(500).json({ error: 'Failed to create machine' });
    }
};
exports.createMachine = createMachine;
const updateMachine = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error updating machine:', error);
        res.status(500).json({ error: 'Failed to update machine' });
    }
};
exports.updateMachine = updateMachine;
const deleteMachine = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.machine.delete({
            where: { id }
        });
        res.json({ message: 'Machine deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Error deleting machine:', error);
        res.status(500).json({ error: 'Failed to delete machine' });
    }
};
exports.deleteMachine = deleteMachine;
const getProductionSchedules = async (req, res) => {
    try {
        const { workCenterId, date } = req.query;
        const where = {};
        if (workCenterId)
            where.workCenterId = workCenterId;
        if (date) {
            const startDate = new Date(date);
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
    }
    catch (error) {
        logger_1.default.error('Error fetching production schedules:', error);
        res.status(500).json({ error: 'Failed to fetch production schedules' });
    }
};
exports.getProductionSchedules = getProductionSchedules;
const getProductionKPIs = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const now = new Date();
        let startDate;
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
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const totalUnitsProduced = records.reduce((sum, r) => sum + r.quantityProduced, 0);
        const totalUnitsRejected = records.reduce((sum, r) => sum + r.quantityRejected, 0);
        const overallEfficiency = totalUnitsProduced > 0 ?
            ((totalUnitsProduced - totalUnitsRejected) / totalUnitsProduced) * 100 : 0;
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
                plannedHours: wcRecords.length * 8,
                actualHours: wcRecords.reduce((sum, r) => sum + r.duration, 0),
                utilization: wcRecords.length > 0 ?
                    (wcRecords.reduce((sum, r) => sum + r.duration, 0) / (wcRecords.length * 8)) * 100 : 0
            };
        });
        const machineEfficiency = workCenters.flatMap(wc => wc.machines.map(machine => {
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
                maintenanceHours: 0
            };
        }));
        const qualityPassed = records.filter(r => r.qualityPassed).length;
        const firstPassYield = records.length > 0 ? (qualityPassed / records.length) * 100 : 0;
        const defectRate = totalUnitsProduced > 0 ? (totalUnitsRejected / totalUnitsProduced) * 100 : 0;
        const materialCosts = records.reduce((sum, r) => sum + r.materialUsage.reduce((msum, mu) => msum + Number(mu.totalCost), 0), 0);
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
                reworkRate: 0,
                customerComplaints: 0
            },
            productivity: {
                unitsProduced: totalUnitsProduced,
                plannedUnits: orders.reduce((sum, o) => sum + o.quantity, 0),
                productivityRate: Math.round(overallEfficiency * 100) / 100,
                overtimeHours: 0,
                utilizationRate: Math.round(overallEfficiency * 100) / 100
            },
            costs: {
                materialCosts,
                laborCosts: 0,
                overheadCosts: 0,
                totalCosts: materialCosts,
                costPerUnit: totalUnitsProduced > 0 ? materialCosts / totalUnitsProduced : 0
            },
            delivery: {
                onTimeDelivery: Math.round(firstPassYield * 100) / 100,
                averageLeadTime: 0,
                scheduleAdherence: Math.round(overallEfficiency * 100) / 100
            }
        };
        res.json(kpis);
    }
    catch (error) {
        logger_1.default.error('Error fetching production KPIs:', error);
        res.status(500).json({ error: 'Failed to fetch production KPIs' });
    }
};
exports.getProductionKPIs = getProductionKPIs;
const getProductionReport = async (req, res) => {
    try {
        const { reportType = 'monthly', fromDate, toDate } = req.query;
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
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
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;
        const totalUnitsProduced = records.reduce((sum, r) => sum + r.quantityProduced, 0);
        const totalUnitsRejected = records.reduce((sum, r) => sum + r.quantityRejected, 0);
        const overallEfficiency = totalUnitsProduced > 0 ?
            ((totalUnitsProduced - totalUnitsRejected) / totalUnitsProduced) * 100 : 0;
        const workCenterPerformance = workCenters.map(wc => {
            const wcRecords = records.filter(r => r.workCenter === wc.name);
            const wcOrders = orders.filter(o => o.workCenterId === wc.id);
            const wcUnitsProduced = wcRecords.reduce((sum, r) => sum + r.quantityProduced, 0);
            const wcUnitsRejected = wcRecords.reduce((sum, r) => sum + r.quantityRejected, 0);
            const efficiency = wcUnitsProduced > 0 ?
                ((wcUnitsProduced - wcUnitsRejected) / wcUnitsProduced) * 100 : 0;
            const materialCosts = wcRecords.reduce((sum, r) => sum + r.materialUsage.reduce((msum, mu) => msum + Number(mu.totalCost), 0), 0);
            return {
                workCenterId: wc.id,
                workCenterName: wc.name,
                ordersCompleted: wcOrders.filter(o => o.status === 'completed').length,
                unitsProduced: wcUnitsProduced,
                efficiency: Math.round(efficiency * 100) / 100,
                utilization: wcRecords.length > 0 ?
                    (wcRecords.reduce((sum, r) => sum + r.duration, 0) / (wcRecords.length * 8)) * 100 : 0,
                downtime: 0,
                costs: materialCosts
            };
        });
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
            }
            else {
                acc.push({
                    productId: order.productId,
                    productName: order.productName,
                    ordersCompleted: order.status === 'completed' ? 1 : 0,
                    unitsProduced,
                    unitsRejected,
                    yield: Math.round(yieldRate * 100) / 100,
                    averageCycleTime: orderRecords.length > 0 ?
                        orderRecords.reduce((sum, r) => sum + r.duration, 0) / orderRecords.length : 0,
                    costs: orderRecords.reduce((sum, r) => sum + r.materialUsage.reduce((msum, mu) => msum + Number(mu.totalCost), 0), 0)
                });
            }
            return acc;
        }, []);
        const qualityMetrics = records.flatMap(r => r.qualityMetrics).reduce((acc, metric) => {
            const existing = acc.find(m => m.metric === metric.metricName);
            if (existing) {
                existing.actual = (existing.actual + metric.actualValue) / 2;
            }
            else {
                acc.push({
                    metric: metric.metricName,
                    target: metric.targetValue,
                    actual: metric.actualValue,
                    variance: metric.actualValue - metric.targetValue,
                    status: metric.passed ? 'pass' : 'fail'
                });
            }
            return acc;
        }, []);
        const materialUsage = records.flatMap(r => r.materialUsage).reduce((acc, usage) => {
            const existing = acc.find(m => m.materialId === usage.materialId);
            if (existing) {
                existing.actualQuantity += usage.quantityUsed;
                existing.wastage += usage.wastage;
                existing.cost += Number(usage.totalCost);
            }
            else {
                acc.push({
                    materialId: usage.materialId,
                    materialName: usage.material.materialName,
                    plannedQuantity: usage.quantityUsed,
                    actualQuantity: usage.quantityUsed,
                    variance: 0,
                    wastage: usage.wastage,
                    cost: Number(usage.totalCost)
                });
            }
            return acc;
        }, []);
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
    }
    catch (error) {
        logger_1.default.error('Error generating production report:', error);
        res.status(500).json({ error: 'Failed to generate production report' });
    }
};
exports.getProductionReport = getProductionReport;
const exportProductionReport = async (req, res) => {
    try {
        const reportData = await (0, exports.getProductionReport)(req, res);
        res.json({ message: 'Export functionality would be implemented here', data: reportData });
    }
    catch (error) {
        logger_1.default.error('Error exporting production report:', error);
        res.status(500).json({ error: 'Failed to export production report' });
    }
};
exports.exportProductionReport = exportProductionReport;
//# sourceMappingURL=production.controller.js.map