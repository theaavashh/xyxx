// Role-based User Types (matching backend Prisma enum)
export type UserRole = 'ADMIN' | 'MANAGERIAL' | 'SALES_MANAGER' | 'SALES_REPRESENTATIVE' | 'DISTRIBUTOR';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  address: string;
  department: string;
  position: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication Context
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Orders (received from distributors)
export interface Order {
  id: string;
  distributorId: string;
  distributorName: string;
  distributorEmail: string;
  distributorPhone: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  status: 'pending' | 'confirmed' | 'in_production' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  assignedTo?: string; // Production manager ID
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
}

// Product Management
export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  unitPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Accounting - VAT Bills (Nepal specific)
export interface VATBill {
  id: string;
  billNumber: string;
  vendorName: string;
  vendorPAN: string;
  vendorVATNumber?: string;
  billDate: Date;
  description: string;
  taxableAmount: number;
  vatRate: number; // Nepal standard rate: 13%
  vatAmount: number;
  totalAmount: number;
  billType: 'purchase' | 'sales' | 'service';
  status: 'draft' | 'approved' | 'paid';
  paymentStatus: 'pending' | 'partial' | 'paid';
  dueDate?: Date;
  enteredBy: string;
  enteredAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  attachments?: string[]; // File paths
  fiscalYear: string;
  quarter: number;
}

// Accounting - Ledger Entries
export interface LedgerEntry {
  id: string;
  date: Date;
  accountName: string;
  accountCode: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  referenceId?: string; // Reference to VAT bill, journal entry, etc.
  referenceType?: 'vat_bill' | 'journal_entry' | 'order' | 'payment';
  enteredBy: string;
  enteredAt: Date;
}

// Accounting - Journal Entries
export interface JournalEntry {
  id: string;
  date: Date;
  journalNumber: string;
  companyName: string;
  description: string;
  entries: JournalLineItem[];
  totalDebit: number;
  totalCredit: number;
  status: 'DRAFT' | 'POSTED';
  createdBy: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  postedBy?: string;
  postedAt?: Date;
}

export interface JournalLineItem {
  id: string;
  accountId: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  account?: Account; // For when we include account details
}

// Chart of Accounts
export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  description?: string;
  isActive: boolean;
  parentId?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Employee Management (for Managerial role)
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  role: UserRole;
  joiningDate: Date;
  salary: number;
  isActive: boolean;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Production Planning
export interface ProductionPlan {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantityToProduce: number;
  scheduledStartDate: Date;
  scheduledEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  assignedWorkers: string[];
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Distributor Management
export interface Distributor {
  id: string;
  distributorId: string;
  
  // Company Information
  companyName: string;
  businessType: string;
  establishedYear: number;
  registrationNumber: string;
  panNumber: string;
  vatNumber?: string;
  
  // Contact Information
  contactPersonName: string;
  contactPersonTitle: string;
  email: string;
  phoneNumber: string;
  alternatePhone?: string;
  website?: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  warehouseAddress?: string;
  deliveryInstructions?: string;
  
  // Financial Information
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  swiftCode?: string;
  branchName: string;
  creditLimit: number;
  paymentTerms: string;
  
  // Documents & Additional Info
  businessLicense?: string;
  taxCertificate?: string;
  tradeLicense?: string;
  otherDocuments?: string;
  specialRequirements?: string;
  notes?: string;
  
  // System Information
  status: 'pending_approval' | 'active' | 'suspended' | 'inactive';
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastOrderDate?: Date;
  totalOrders: number;
  totalOrderValue: number;
}

// Dashboard Statistics
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inProductionOrders: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalEmployees: number;
  activeEmployees: number;
  lowStockProducts: number;
  pendingVATBills: number;
  totalDistributors?: number;
  activeDistributors?: number;
  // Today's specific metrics
  todayRevenue?: number;
  todayOrders?: number;
  todayNewDistributors?: number;
  todayCompletedOrders?: number;
  todayPendingPayments?: number;
  todayProductionOutput?: number;
  todayEmployeeAttendance?: number;
}

// Form Types
export interface CreateEmployeeForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  role: UserRole;
  joiningDate: string;
  salary: number;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  password: string;
  confirmPassword: string;
}

export interface VATBillForm {
  billNumber: string;
  vendorName: string;
  vendorPAN: string;
  billDate: string;
  description: string;
  taxableAmount: number;
  vatRate: number;
  billType: 'purchase' | 'sales' | 'service';
}

export interface JournalEntryForm {
  date: string;
  description: string;
  entries: {
    accountCode: string;
    accountName: string;
    description: string;
    debitAmount: number;
    creditAmount: number;
  }[];
}

// Distributor Types
export interface DistributorPersonDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  nationalId: string;
}

export interface DistributorCompanyDetails {
  companyName: string;
  companyType: 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP' | 'PRIVATE_LIMITED' | 'PUBLIC_LIMITED';
  registrationNumber: string;
  panNumber: string;
  vatNumber?: string;
  establishedDate: string;
  companyAddress: string;
  website?: string;
  description?: string;
}

export interface DistributorCredentials {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface DistributorDocument {
  id: string;
  name: string;
  type: 'CITIZENSHIP' | 'PAN_CARD' | 'COMPANY_REGISTRATION' | 'VAT_CERTIFICATE' | 'OTHER';
  url: string;
  uploadedAt: string;
}

export interface Distributor {
  id: string;
  personDetails: DistributorPersonDetails;
  companyDetails: DistributorCompanyDetails;
  credentials: {
    username: string;
    // password is not returned for security
  };
  documents: DistributorDocument[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface CreateDistributorFormData {
  // Person Details
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  nationalId: string;
  
  // Company Details
  companyName: string;
  companyType: 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP' | 'PRIVATE_LIMITED' | 'PUBLIC_LIMITED';
  registrationNumber: string;
  panNumber: string;
  vatNumber?: string;
  establishedDate: string;
  companyAddress: string;
  website?: string;
  description?: string;
  
  // Credentials
  username: string;
  password: string;
  confirmPassword: string;
  
  // Documents (files will be handled separately)
  documents: File[];
}

// Sales Analytics Types
export interface SalesData {
  date: string;
  amount: number;
  orders: number;
  distributorId?: string;
  province?: string;
  district?: string;
}

export interface DistributorSales {
  distributorId: string;
  distributorName: string;
  province: string;
  district: string;
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  lastYear: number;
  growth: number;
  orders: number;
}

export interface ProvinceSales {
  province: string;
  sales: number;
  distributors: number;
  orders: number;
  growth: number;
}

export interface MonthlySalesComparison {
  month: string;
  thisYear: number;
  lastYear: number;
  growth: number;
}

export interface SalesAnalytics {
  totalSales: number;
  totalOrders: number;
  totalDistributors: number;
  avgOrderValue: number;
  growth: number;
  provinceSales: ProvinceSales[];
  distributorSales: DistributorSales[];
  monthlySales: MonthlySalesComparison[];
  topProducts: {
    name: string;
    sales: number;
    orders: number;
  }[];
}

// Purchase Entry Interface
export interface PurchaseEntry {
  id: string;
  purchaseNumber: string;
  supplierName: string;
  supplierPAN: string;
  supplierAddress: string;
  purchaseDate: Date;
  items: PurchaseItem[];
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'credit' | 'bank_transfer' | 'cheque';
  paymentStatus: 'pending' | 'partial' | 'paid';
  dueDate?: Date;
  notes?: string;
  enteredBy: string;
  enteredAt: Date;
  fiscalYear: string;
}

export interface PurchaseItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vatApplicable: boolean;
}

// Party Ledger (Customer/Supplier Accounts)
export interface PartyLedger {
  id: string;
  partyName: string;
  partyType: 'customer' | 'supplier';
  panNumber?: string;
  address?: string;
  contactNumber?: string;
  email?: string;
  openingBalance: number;
  openingBalanceType: 'debit' | 'credit';
  currentBalance: number;
  creditLimit?: number;
  transactions: PartyTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PartyTransaction {
  id: string;
  date: Date;
  description: string;
  referenceNumber: string;
  referenceType: 'invoice' | 'payment' | 'purchase' | 'adjustment';
  debitAmount: number;
  creditAmount: number;
  balance: number;
  createdBy: string;
  createdAt: Date;
}

// Debtors and Creditors Report
export interface DebtorsCreditors {
  id: string;
  partyName: string;
  partyType: 'debtor' | 'creditor';
  panNumber?: string;
  contactNumber?: string;
  outstandingAmount: number;
  overdueAmount: number;
  agingBrackets: {
    current: number; // 0-30 days
    thirtyDays: number; // 31-60 days
    sixtyDays: number; // 61-90 days
    ninetyDaysPlus: number; // 90+ days
  };
  lastTransactionDate: Date;
}

// Purchase and Sales Reports
export interface PurchaseSalesReport {
  reportType: 'purchase' | 'sales';
  fromDate: Date;
  toDate: Date;
  summary: {
    totalAmount: number;
    totalVAT: number;
    totalTransactions: number;
    averageTransactionValue: number;
  };
  details: PurchaseSalesDetail[];
  vatSummary: {
    vatableAmount: number;
    exemptAmount: number;
    totalVAT: number;
    vatRate: number;
  };
}

export interface PurchaseSalesDetail {
  id: string;
  date: Date;
  billNumber: string;
  partyName: string;
  panNumber?: string;
  description: string;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
  billType: 'purchase' | 'sales' | 'service';
}

// VAT Report (Nepal specific)
export interface VATReport {
  fiscalYear: string;
  quarter: number;
  fromDate: Date;
  toDate: Date;
  purchases: {
    taxablePurchases: number;
    inputVAT: number;
    exemptPurchases: number;
    totalPurchases: number;
  };
  sales: {
    taxableSales: number;
    outputVAT: number;
    exemptSales: number;
    totalSales: number;
  };
  vatSummary: {
    outputVAT: number;
    inputVAT: number;
    netVATPayable: number; // Output VAT - Input VAT
    vatRefundable?: number; // If Input VAT > Output VAT
  };
  monthlyBreakdown: VATMonthlyBreakdown[];
}

export interface VATMonthlyBreakdown {
  month: string;
  taxablePurchases: number;
  inputVAT: number;
  taxableSales: number;
  outputVAT: number;
  netVAT: number;
}

// Trial Balance
export interface TrialBalance {
  asOfDate: Date;
  accounts: TrialBalanceAccount[];
  totals: {
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
  };
  generatedBy: string;
  generatedAt: Date;
}

export interface TrialBalanceAccount {
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  debitBalance: number;
  creditBalance: number;
}

// Balance Sheet
export interface BalanceSheet {
  asOfDate: Date;
  assets: {
    currentAssets: BalanceSheetItem[];
    fixedAssets: BalanceSheetItem[];
    totalCurrentAssets: number;
    totalFixedAssets: number;
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: BalanceSheetItem[];
    longTermLiabilities: BalanceSheetItem[];
    totalCurrentLiabilities: number;
    totalLongTermLiabilities: number;
    totalLiabilities: number;
  };
  equity: {
    items: BalanceSheetItem[];
    totalEquity: number;
  };
  isBalanced: boolean;
  generatedBy: string;
  generatedAt: Date;
}

export interface BalanceSheetItem {
  accountCode: string;
  accountName: string;
  amount: number;
  previousYearAmount?: number;
  percentChange?: number;
}

// MIS Report (Management Information System)
export interface MISReport {
  reportDate: Date;
  reportPeriod: {
    fromDate: Date;
    toDate: Date;
    periodType: 'monthly' | 'quarterly' | 'annually';
  };
  financialMetrics: {
    grossRevenue: number;
    netRevenue: number;
    grossProfit: number;
    operatingExpenses: number;
    operatingProfit: number;
    netProfit: number;
    grossProfitMargin: number;
    operatingProfitMargin: number;
    netProfitMargin: number;
  };
  keyRatios: {
    currentRatio: number;
    quickRatio: number;
    debtToEquityRatio: number;
    returnOnAssets: number;
    returnOnEquity: number;
    inventoryTurnover: number;
    receivablesTurnover: number;
  };
  cashFlow: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashFlow: number;
    cashBalance: number;
  };
  comparison: {
    previousPeriod: MISPeriodData;
    yearToDate: MISPeriodData;
    budget: MISPeriodData;
  };
}

export interface MISPeriodData {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  variance?: number;
  variancePercentage?: number;
}

// Production Management Types

// Raw Material Management
export interface RawMaterial {
  id: string;
  materialCode: string;
  materialName: string;
  categoryId: string;
  category: RawMaterialCategory;
  description?: string;
  unit: 'kg' | 'liter' | 'piece' | 'meter' | 'gram' | 'ton';
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitCost: number;
  supplierId?: string;
  supplierName?: string;
  location: string; // Warehouse location
  shelfLife?: number; // in days
  batchNumber?: string;
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawMaterialCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface RawMaterialTransaction {
  id: string;
  materialId: string;
  materialName: string;
  transactionType: 'purchase' | 'consumption' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  unitCost: number;
  totalCost: number;
  referenceNumber: string;
  referenceType: 'purchase_order' | 'production_order' | 'adjustment' | 'transfer' | 'return';
  batchNumber?: string;
  expiryDate?: Date;
  location: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

// Production Management
export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planned' | 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  assignedWorkers: string[];
  assignedMachines: string[];
  workCenter: string;
  estimatedDuration: number; // in hours
  actualDuration?: number; // in hours
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionRecord {
  id: string;
  productionOrderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  batchNumber: string;
  quantityPlanned: number;
  quantityProduced: number;
  quantityRejected: number;
  quantityAccepted: number;
  startTime: Date;
  endTime: Date;
  duration: number; // in hours
  workCenter: string;
  shift: 'morning' | 'afternoon' | 'night';
  operatorId: string;
  operatorName: string;
  supervisorId: string;
  supervisorName: string;
  qualityCheck: {
    passed: boolean;
    checkedBy: string;
    checkedAt: Date;
    notes?: string;
  };
  materialsUsed: ProductionMaterialUsage[];
  machinesUsed: ProductionMachineUsage[];
  qualityMetrics: QualityMetric[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionMaterialUsage {
  id: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  quantityUsed: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
  wastage: number;
  wastagePercentage: number;
}

export interface ProductionMachineUsage {
  id: string;
  machineId: string;
  machineName: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in hours
  efficiency: number; // percentage
  maintenanceRequired: boolean;
  notes?: string;
}

export interface QualityMetric {
  id: string;
  metricName: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  tolerance: number;
  passed: boolean;
  notes?: string;
}

// Work Centers and Machines
export interface WorkCenter {
  id: string;
  name: string;
  code: string;
  description?: string;
  capacity: number; // units per hour
  efficiency: number; // percentage
  isActive: boolean;
  machines: Machine[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Machine {
  id: string;
  name: string;
  code: string;
  workCenterId: string;
  workCenterName: string;
  type: string;
  model: string;
  capacity: number; // units per hour
  efficiency: number; // percentage
  status: 'operational' | 'maintenance' | 'breakdown' | 'idle';
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Production Planning and Scheduling
export interface ProductionSchedule {
  id: string;
  scheduleDate: Date;
  workCenterId: string;
  workCenterName: string;
  shift: 'morning' | 'afternoon' | 'night';
  orders: ScheduledOrder[];
  totalPlannedHours: number;
  totalActualHours?: number;
  efficiency: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledOrder {
  id: string;
  productionOrderId: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  assignedWorkers: string[];
  assignedMachines: string[];
}

// Bill of Materials (BOM)
export interface BillOfMaterials {
  id: string;
  productId: string;
  productName: string;
  version: string;
  isActive: boolean;
  items: BOMItem[];
  totalCost: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BOMItem {
  id: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  isOptional: boolean;
  notes?: string;
}

// Production Analytics and KPIs
export interface ProductionKPIs {
  period: {
    fromDate: Date;
    toDate: Date;
  };
  efficiency: {
    overallEfficiency: number;
    workCenterEfficiency: WorkCenterEfficiency[];
    machineEfficiency: MachineEfficiency[];
  };
  quality: {
    firstPassYield: number;
    defectRate: number;
    reworkRate: number;
    customerComplaints: number;
  };
  productivity: {
    unitsProduced: number;
    plannedUnits: number;
    productivityRate: number;
    overtimeHours: number;
    utilizationRate: number;
  };
  costs: {
    materialCosts: number;
    laborCosts: number;
    overheadCosts: number;
    totalCosts: number;
    costPerUnit: number;
  };
  delivery: {
    onTimeDelivery: number;
    averageLeadTime: number;
    scheduleAdherence: number;
  };
}

export interface WorkCenterEfficiency {
  workCenterId: string;
  workCenterName: string;
  efficiency: number;
  plannedHours: number;
  actualHours: number;
  utilization: number;
}

export interface MachineEfficiency {
  machineId: string;
  machineName: string;
  efficiency: number;
  uptime: number;
  downtime: number;
  maintenanceHours: number;
}

// Production Reports
export interface ProductionReport {
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  period: {
    fromDate: Date;
    toDate: Date;
  };
  summary: {
    totalOrders: number;
    completedOrders: number;
    inProgressOrders: number;
    totalUnitsProduced: number;
    totalUnitsRejected: number;
    overallEfficiency: number;
    totalCosts: number;
  };
  workCenterPerformance: WorkCenterPerformance[];
  productPerformance: ProductPerformance[];
  qualityMetrics: QualityReport[];
  materialUsage: MaterialUsageReport[];
}

export interface WorkCenterPerformance {
  workCenterId: string;
  workCenterName: string;
  ordersCompleted: number;
  unitsProduced: number;
  efficiency: number;
  utilization: number;
  downtime: number;
  costs: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  ordersCompleted: number;
  unitsProduced: number;
  unitsRejected: number;
  yield: number;
  averageCycleTime: number;
  costs: number;
}

export interface QualityReport {
  metric: string;
  target: number;
  actual: number;
  variance: number;
  status: 'pass' | 'fail' | 'warning';
}

export interface MaterialUsageReport {
  materialId: string;
  materialName: string;
  plannedQuantity: number;
  actualQuantity: number;
  variance: number;
  wastage: number;
  cost: number;
}

// Production Forms
export interface RawMaterialForm {
  materialCode: string;
  materialName: string;
  category: string;
  description?: string;
  unit: 'kg' | 'liter' | 'piece' | 'meter' | 'gram' | 'ton';
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitCost: number;
  supplierId?: string;
  location: string;
  shelfLife?: number;
  isActive?: boolean;
}

export interface ProductionOrderForm {
  productId: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  plannedStartDate: string;
  plannedEndDate: string;
  workCenter: string;
  assignedWorkers: string[];
  assignedMachines: string[];
  notes?: string;
}

export interface ProductionRecordForm {
  productionOrderId: string;
  batchNumber: string;
  quantityProduced: number;
  quantityRejected: number;
  startTime: string;
  endTime: string;
  workCenter: string;
  shift: 'morning' | 'afternoon' | 'night';
  operatorId: string;
  supervisorId: string;
  materialsUsed: {
    materialId: string;
    quantityUsed: number;
    wastage: number;
  }[];
  qualityMetrics: {
    metricName: string;
    actualValue: number;
    notes?: string;
  }[];
  notes?: string;
}

export interface BOMForm {
  productId: string;
  version: string;
  items: {
    materialId: string;
    quantity: number;
    isOptional: boolean;
    notes?: string;
  }[];
}
