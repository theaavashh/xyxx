import { Router } from 'express';
import {
  // Raw Materials
  getRawMaterials,
  getRawMaterialById,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getRawMaterialCategories,
  createRawMaterialCategory,
  updateRawMaterialCategory,
  deleteRawMaterialCategory,
  getRawMaterialTransactions,
  
  // Production Orders
  getProductionOrders,
  getProductionOrderById,
  createProductionOrder,
  updateProductionOrder,
  updateProductionOrderStatus,
  deleteProductionOrder,
  
  // Production Records
  getProductionRecords,
  getProductionRecordById,
  createProductionRecord,
  
  // Work Centers
  getWorkCenters,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter,
  
  // Machines
  getMachines,
  createMachine,
  updateMachine,
  deleteMachine,
  
  // Production Schedules
  getProductionSchedules,
  
  // Production Charts
  getProductionCharts,
  getProductionChartById,
  createProductionChart,
  updateProductionChart,
  deleteProductionChart,
  getProductionChartSummary,
  
  // Wastage Management
  createWastageEntry,
  getWastageEntries,
  getWastageEntryById,
  updateWastageEntry,
  deleteWastageEntry,
  getWastageSummary,
  getWastageReasons,
  
  // Analytics
  getProductionKPIs,
  getProductionReport,
  exportProductionReport
} from '../controllers/production.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Raw Material Management Routes
router.get('/raw-materials', getRawMaterials);
router.get('/raw-materials/categories', getRawMaterialCategories);
router.post('/raw-materials/categories', createRawMaterialCategory);
router.put('/raw-materials/categories/:id', updateRawMaterialCategory);
router.delete('/raw-materials/categories/:id', deleteRawMaterialCategory);
router.get('/raw-materials/transactions', getRawMaterialTransactions);
router.get('/raw-materials/:id', getRawMaterialById);
router.post('/raw-materials', createRawMaterial);
router.put('/raw-materials/:id', updateRawMaterial);
router.delete('/raw-materials/:id', deleteRawMaterial);

// Production Order Routes
router.get('/orders', getProductionOrders);
router.get('/orders/:id', getProductionOrderById);
router.post('/orders', createProductionOrder);
router.put('/orders/:id', updateProductionOrder);
router.patch('/orders/:id/status', updateProductionOrderStatus);
router.delete('/orders/:id', deleteProductionOrder);

// Production Record Routes
router.get('/records', getProductionRecords);
router.get('/records/:id', getProductionRecordById);
router.post('/records', createProductionRecord);

// Work Center Routes
router.get('/work-centers', getWorkCenters);
router.post('/work-centers', createWorkCenter);
router.put('/work-centers/:id', updateWorkCenter);
router.delete('/work-centers/:id', deleteWorkCenter);

// Machine Routes
router.get('/machines', getMachines);
router.post('/machines', createMachine);
router.put('/machines/:id', updateMachine);
router.delete('/machines/:id', deleteMachine);

// Production Schedule Routes
router.get('/schedules', getProductionSchedules);

// Production Chart Routes
router.get('/charts', getProductionCharts);
router.get('/charts/summary', getProductionChartSummary);
router.get('/charts/:id', getProductionChartById);
router.post('/charts', createProductionChart);
router.put('/charts/:id', updateProductionChart);
router.delete('/charts/:id', deleteProductionChart);

// Raw Material Wastage Routes
router.get('/wastage', getWastageEntries);
router.get('/wastage/reasons', getWastageReasons);
router.get('/wastage/summary', getWastageSummary);
router.get('/wastage/:id', getWastageEntryById);
router.post('/wastage', createWastageEntry);
router.put('/wastage/:id', updateWastageEntry);
router.delete('/wastage/:id', deleteWastageEntry);

// Analytics Routes
router.get('/analytics/kpis', getProductionKPIs);
router.get('/analytics/reports', getProductionReport);
router.get('/analytics/export', exportProductionReport);

export default router;
