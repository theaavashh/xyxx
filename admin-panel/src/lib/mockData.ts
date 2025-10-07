import { 
  User, Order, OrderItem, Product, VATBill, LedgerEntry, JournalEntry, Account, Employee, ProductionPlan, DashboardStats, Distributor,
  PurchaseEntry, PurchaseItem, PartyLedger, PartyTransaction, DebtorsCreditors, PurchaseSalesReport, PurchaseSalesDetail,
  VATReport, VATMonthlyBreakdown, TrialBalance, TrialBalanceAccount, BalanceSheet, BalanceSheetItem, MISReport, MISPeriodData
} from '@/types';

// Mock Users with different roles
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'manager@company.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Manager',
    role: 'MANAGERIAL',
    department: 'Management',
    employeeId: 'MAN0001',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    phoneNumber: '9841234567',
    joiningDate: new Date('2024-01-01'),
    salary: 80000,
    permissions: ['create_employee', 'view_all_reports', 'approve_expenses']
  },
  {
    id: '2',
    email: 'sales@company.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Sales',
    role: 'SALES_REPRESENTATIVE',
    department: 'Sales',
    employeeId: 'SAL0001',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    createdBy: '1',
    phoneNumber: '9841234568',
    joiningDate: new Date('2024-01-15'),
    salary: 45000,
    permissions: ['view_orders', 'update_order_status']
  },
  {
    id: '3',
    email: 'accountant@company.com',
    password: 'password123',
    firstName: 'Alex',
    lastName: 'Accountant',
    role: 'ADMIN',
    department: 'Finance',
    employeeId: 'FIN0001',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    createdBy: '1',
    phoneNumber: '9841234569',
    joiningDate: new Date('2024-01-20'),
    salary: 55000,
    permissions: ['create_vat_bill', 'create_journal_entry', 'view_ledger']
  },
  {
    id: '4',
    email: 'production@company.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Production',
    role: 'ADMIN',
    department: 'Manufacturing',
    employeeId: 'MAN0002',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    createdBy: '1',
    phoneNumber: '9841234570',
    joiningDate: new Date('2024-02-01'),
    salary: 50000,
    permissions: ['view_production_orders', 'update_production_status']
  }
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Premium Soap',
    category: 'Personal Care',
    description: 'High-quality antibacterial soap',
    unitPrice: 45,
    stockQuantity: 500,
    minStockLevel: 100,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'p2',
    name: 'Hand Sanitizer',
    category: 'Personal Care',
    description: '70% alcohol hand sanitizer',
    unitPrice: 120,
    stockQuantity: 200,
    minStockLevel: 50,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'p3',
    name: 'Detergent Powder',
    category: 'Cleaning',
    description: 'Heavy-duty laundry detergent',
    unitPrice: 180,
    stockQuantity: 150,
    minStockLevel: 30,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'p4',
    name: 'Dishwashing Liquid',
    category: 'Cleaning',
    description: 'Effective grease cutting formula',
    unitPrice: 95,
    stockQuantity: 80,
    minStockLevel: 25,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock Order Items
const mockOrderItems: OrderItem[] = [
  {
    id: 'oi1',
    productId: 'p1',
    productName: 'Premium Soap',
    quantity: 100,
    unitPrice: 45,
    totalPrice: 4500,
    specifications: 'Pack of 12 pieces'
  },
  {
    id: 'oi2',
    productId: 'p2',
    productName: 'Hand Sanitizer',
    quantity: 50,
    unitPrice: 120,
    totalPrice: 6000
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'ord001',
    distributorId: 'dist001',
    distributorName: 'ABC Distribution Pvt. Ltd.',
    distributorEmail: 'orders@abcdist.com',
    distributorPhone: '9841111111',
    orderDate: new Date('2024-08-25'),
    expectedDeliveryDate: new Date('2024-09-05'),
    status: 'pending',
    priority: 'high',
    items: [mockOrderItems[0]],
    totalAmount: 4500,
    notes: 'Rush order for festival season',
    createdAt: new Date('2024-08-25'),
    updatedAt: new Date('2024-08-25')
  },
  {
    id: 'ord002',
    distributorId: 'dist002',
    distributorName: 'XYZ Trading Company',
    distributorEmail: 'purchase@xyztrading.com',
    distributorPhone: '9842222222',
    orderDate: new Date('2024-08-26'),
    expectedDeliveryDate: new Date('2024-09-10'),
    status: 'in_production',
    priority: 'medium',
    items: [mockOrderItems[1]],
    totalAmount: 6000,
    assignedTo: '4',
    createdAt: new Date('2024-08-26'),
    updatedAt: new Date('2024-08-27')
  },
  {
    id: 'ord003',
    distributorId: 'dist003',
    distributorName: 'Nepal Suppliers Network',
    distributorEmail: 'info@nsn.com.np',
    distributorPhone: '9843333333',
    orderDate: new Date('2024-08-20'),
    expectedDeliveryDate: new Date('2024-08-30'),
    status: 'ready',
    priority: 'low',
    items: [...mockOrderItems],
    totalAmount: 10500,
    assignedTo: '4',
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-28')
  }
];

// Mock Chart of Accounts
export const mockAccounts: Account[] = [
  { id: 'acc001', code: '1000', name: 'Cash', type: 'asset', subType: 'current_asset', isActive: true, createdAt: new Date() },
  { id: 'acc002', code: '1100', name: 'Accounts Receivable', type: 'asset', subType: 'current_asset', isActive: true, createdAt: new Date() },
  { id: 'acc003', code: '1200', name: 'Inventory', type: 'asset', subType: 'current_asset', isActive: true, createdAt: new Date() },
  { id: 'acc004', code: '2000', name: 'Accounts Payable', type: 'liability', subType: 'current_liability', isActive: true, createdAt: new Date() },
  { id: 'acc005', code: '2100', name: 'VAT Payable', type: 'liability', subType: 'current_liability', isActive: true, createdAt: new Date() },
  { id: 'acc006', code: '3000', name: 'Capital', type: 'equity', subType: 'owner_equity', isActive: true, createdAt: new Date() },
  { id: 'acc007', code: '4000', name: 'Sales Revenue', type: 'revenue', subType: 'operating_revenue', isActive: true, createdAt: new Date() },
  { id: 'acc008', code: '5000', name: 'Cost of Goods Sold', type: 'expense', subType: 'cost_of_sales', isActive: true, createdAt: new Date() },
  { id: 'acc009', code: '6000', name: 'Operating Expenses', type: 'expense', subType: 'operating_expense', isActive: true, createdAt: new Date() }
];

// Mock VAT Bills
export const mockVATBills: VATBill[] = [
  {
    id: 'vat001',
    billNumber: 'BILL20240001',
    vendorName: 'Raw Material Suppliers Ltd.',
    vendorPAN: '123456789',
    billDate: new Date('2024-08-25'),
    description: 'Purchase of raw materials for soap production',
    taxableAmount: 50000,
    vatRate: 13,
    vatAmount: 6500,
    totalAmount: 56500,
    billType: 'purchase',
    status: 'approved',
    enteredBy: '3',
    enteredAt: new Date('2024-08-25'),
    approvedBy: '1',
    approvedAt: new Date('2024-08-26')
  },
  {
    id: 'vat002',
    billNumber: 'BILL20240002',
    vendorName: 'Packaging Solutions Pvt. Ltd.',
    vendorPAN: '987654321',
    billDate: new Date('2024-08-26'),
    description: 'Packaging materials and labels',
    taxableAmount: 25000,
    vatRate: 13,
    vatAmount: 3250,
    totalAmount: 28250,
    billType: 'purchase',
    status: 'draft',
    enteredBy: '3',
    enteredAt: new Date('2024-08-26')
  }
];

// Mock Ledger Entries
export const mockLedgerEntries: LedgerEntry[] = [
  {
    id: 'led001',
    date: new Date('2024-08-25'),
    accountName: 'Inventory',
    accountCode: '1200',
    description: 'Purchase of raw materials',
    debitAmount: 50000,
    creditAmount: 0,
    balance: 50000,
    referenceId: 'vat001',
    referenceType: 'vat_bill',
    enteredBy: '3',
    enteredAt: new Date('2024-08-25')
  },
  {
    id: 'led002',
    date: new Date('2024-08-25'),
    accountName: 'VAT Receivable',
    accountCode: '1150',
    description: 'VAT on purchases',
    debitAmount: 6500,
    creditAmount: 0,
    balance: 6500,
    referenceId: 'vat001',
    referenceType: 'vat_bill',
    enteredBy: '3',
    enteredAt: new Date('2024-08-25')
  },
  {
    id: 'led003',
    date: new Date('2024-08-25'),
    accountName: 'Accounts Payable',
    accountCode: '2000',
    description: 'Purchase from Raw Material Suppliers Ltd.',
    debitAmount: 0,
    creditAmount: 56500,
    balance: -56500,
    referenceId: 'vat001',
    referenceType: 'vat_bill',
    enteredBy: '3',
    enteredAt: new Date('2024-08-25')
  }
];

// Mock Journal Entries
export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'je001',
    date: new Date('2024-08-25'),
    journalNumber: 'JE20240825001',
    companyName: 'ABC Suppliers Ltd.',
    description: 'Recording purchase of raw materials with VAT',
    entries: [
      {
        id: 'jel001',
        accountName: 'Inventory',
        accountCode: '1200',
        description: 'Raw materials purchased',
        debitAmount: 50000,
        creditAmount: 0
      },
      {
        id: 'jel002',
        accountName: 'VAT Receivable',
        accountCode: '1150',
        description: 'VAT on purchases',
        debitAmount: 6500,
        creditAmount: 0
      },
      {
        id: 'jel003',
        accountName: 'Accounts Payable',
        accountCode: '2000',
        description: 'Amount payable to supplier',
        debitAmount: 0,
        creditAmount: 56500
      }
    ],
    totalDebit: 56500,
    totalCredit: 56500,
    status: 'posted',
    enteredBy: '3',
    enteredAt: new Date('2024-08-25'),
    postedBy: '3',
    postedAt: new Date('2024-08-25')
  },
  {
    id: 'je002',
    date: new Date('2024-08-26'),
    journalNumber: 'JE20240826001',
    companyName: 'XYZ Trading Co.',
    description: 'Recording sales revenue and VAT',
    entries: [
      {
        id: 'jel004',
        accountName: 'Cash',
        accountCode: '1000',
        description: 'Cash received from sales',
        debitAmount: 113000,
        creditAmount: 0
      },
      {
        id: 'jel005',
        accountName: 'Sales Revenue',
        accountCode: '4000',
        description: 'Sales revenue',
        debitAmount: 0,
        creditAmount: 100000
      },
      {
        id: 'jel006',
        accountName: 'VAT Payable',
        accountCode: '2200',
        description: 'VAT on sales',
        debitAmount: 0,
        creditAmount: 13000
      }
    ],
    totalDebit: 113000,
    totalCredit: 113000,
    status: 'posted',
    enteredBy: '3',
    enteredAt: new Date('2024-08-26'),
    postedBy: '3',
    postedAt: new Date('2024-08-26')
  },
  {
    id: 'je003',
    date: new Date('2024-08-27'),
    journalNumber: 'JE20240827001',
    companyName: 'Nepal Manufacturing Ltd.',
    description: 'Recording operating expenses',
    entries: [
      {
        id: 'jel007',
        accountName: 'Operating Expenses',
        accountCode: '6000',
        description: 'Office supplies and utilities',
        debitAmount: 25000,
        creditAmount: 0
      },
      {
        id: 'jel008',
        accountName: 'Cash',
        accountCode: '1000',
        description: 'Cash paid for expenses',
        debitAmount: 0,
        creditAmount: 25000
      }
    ],
    totalDebit: 25000,
    totalCredit: 25000,
    status: 'draft',
    enteredBy: '3',
    enteredAt: new Date('2024-08-27')
  }
];

// Mock Employees
export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'MAN0001',
    firstName: 'John',
    lastName: 'Manager',
    email: 'manager@company.com',
    phoneNumber: '9841234567',
    department: 'Management',
    position: 'General Manager',
    role: 'MANAGERIAL',
    joiningDate: new Date('2024-01-01'),
    salary: 80000,
    isActive: true,
    address: 'Kathmandu, Nepal',
    emergencyContact: 'Jane Manager',
    emergencyPhone: '9841234500',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    employeeId: 'SAL0001',
    firstName: 'Sarah',
    lastName: 'Sales',
    email: 'sales@company.com',
    phoneNumber: '9841234568',
    department: 'Sales',
    position: 'Sales Executive',
    role: 'SALES_REPRESENTATIVE',
    joiningDate: new Date('2024-01-15'),
    salary: 45000,
    isActive: true,
    address: 'Lalitpur, Nepal',
    emergencyContact: 'Robert Sales',
    emergencyPhone: '9841234501',
    createdBy: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

// Mock Production Plans
export const mockProductionPlans: ProductionPlan[] = [
  {
    id: 'pp001',
    orderId: 'ord002',
    productId: 'p2',
    productName: 'Hand Sanitizer',
    quantityToProduce: 50,
    scheduledStartDate: new Date('2024-08-27'),
    scheduledEndDate: new Date('2024-08-30'),
    actualStartDate: new Date('2024-08-27'),
    status: 'in_progress',
    assignedWorkers: ['worker001', 'worker002'],
    notes: 'Priority production for XYZ Trading Company',
    createdBy: '4',
    createdAt: new Date('2024-08-26'),
    updatedAt: new Date('2024-08-27')
  },
  {
    id: 'pp002',
    orderId: 'ord001',
    productId: 'p1',
    productName: 'Premium Soap',
    quantityToProduce: 100,
    scheduledStartDate: new Date('2024-08-29'),
    scheduledEndDate: new Date('2024-09-02'),
    status: 'scheduled',
    assignedWorkers: ['worker003', 'worker004'],
    notes: 'Rush order - festival season demand',
    createdBy: '4',
    createdAt: new Date('2024-08-25'),
    updatedAt: new Date('2024-08-25')
  }
];

// Mock Distributors
export const mockDistributors: Distributor[] = [
  {
    id: 'dist001',
    distributorId: 'DIST001',
    companyName: 'ABC Distribution Pvt. Ltd.',
    businessType: 'wholesale',
    establishedYear: 2015,
    registrationNumber: 'REG123456',
    panNumber: '123456789',
    vatNumber: 'VAT987654321',
    contactPersonName: 'Ram Bahadur',
    contactPersonTitle: 'General Manager',
    email: 'ram@abcdist.com',
    phoneNumber: '9841111111',
    alternatePhone: '9841111112',
    website: 'https://www.abcdist.com',
    address: 'Teku, Kathmandu',
    city: 'Kathmandu',
    state: 'Bagmati',
    postalCode: '44600',
    country: 'Nepal',
    warehouseAddress: 'Balkhu Industrial Area, Kathmandu',
    deliveryInstructions: 'Call before delivery',
    bankName: 'Nepal Bank Limited',
    accountNumber: '1234567890',
    accountHolderName: 'ABC Distribution Pvt. Ltd.',
    swiftCode: 'NBLNPKKA',
    branchName: 'Teku Branch',
    creditLimit: 500000,
    paymentTerms: 'net_30',
    businessLicense: 'BL789456',
    taxCertificate: 'TC456789',
    tradeLicense: 'TL123789',
    specialRequirements: 'Temperature controlled storage for certain products',
    notes: 'Reliable partner since 2020',
    status: 'active',
    isActive: true,
    createdBy: '2',
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date('2024-08-01'),
    lastOrderDate: new Date('2024-08-25'),
    totalOrders: 45,
    totalOrderValue: 1250000
  },
  {
    id: 'dist002',
    distributorId: 'DIST002',
    companyName: 'XYZ Trading Company',
    businessType: 'retail',
    establishedYear: 2018,
    registrationNumber: 'REG789123',
    panNumber: '987654321',
    contactPersonName: 'Sita Sharma',
    contactPersonTitle: 'Owner',
    email: 'sita@xyztrading.com',
    phoneNumber: '9842222222',
    website: 'https://www.xyztrading.com',
    address: 'New Road, Pokhara',
    city: 'Pokhara',
    state: 'Gandaki',
    postalCode: '33700',
    country: 'Nepal',
    bankName: 'Rastriya Banijya Bank',
    accountNumber: '0987654321',
    accountHolderName: 'XYZ Trading Company',
    branchName: 'Pokhara Branch',
    creditLimit: 200000,
    paymentTerms: 'net_15',
    businessLicense: 'BL456123',
    status: 'active',
    isActive: true,
    createdBy: '2',
    createdAt: new Date('2021-03-10'),
    updatedAt: new Date('2024-07-15'),
    lastOrderDate: new Date('2024-08-20'),
    totalOrders: 28,
    totalOrderValue: 580000
  },
  {
    id: 'dist003',
    distributorId: 'DIST003',
    companyName: 'Nepal Suppliers Network',
    businessType: 'supermarket',
    establishedYear: 2020,
    registrationNumber: 'REG456789',
    panNumber: '456789123',
    contactPersonName: 'Hari Thapa',
    contactPersonTitle: 'Procurement Manager',
    email: 'hari@nsn.com.np',
    phoneNumber: '9843333333',
    address: 'Biratnagar-5, Morang',
    city: 'Biratnagar',
    state: 'Province 1',
    postalCode: '56613',
    country: 'Nepal',
    bankName: 'Nabil Bank Limited',
    accountNumber: '5647382910',
    accountHolderName: 'Nepal Suppliers Network',
    branchName: 'Biratnagar Branch',
    creditLimit: 300000,
    paymentTerms: 'net_45',
    status: 'pending_approval',
    isActive: false,
    createdBy: '2',
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01'),
    totalOrders: 0,
    totalOrderValue: 0
  }
];

// Mock Dashboard Statistics
export const mockDashboardStats: DashboardStats = {
  totalOrders: 15,
  pendingOrders: 5,
  inProductionOrders: 3,
  completedOrders: 7,
  totalRevenue: 250000,
  monthlyRevenue: 45000,
  totalEmployees: 12,
  activeEmployees: 11,
  lowStockProducts: 2,
  pendingVATBills: 3,
  totalDistributors: 3,
  activeDistributors: 2,
  // Today's specific metrics
  todayRevenue: 8500,
  todayOrders: 3,
  todayNewDistributors: 1,
  todayCompletedOrders: 2,
  todayPendingPayments: 4500,
  todayProductionOutput: 120,
  todayEmployeeAttendance: 11
};

// Mock Purchase Entries
export const mockPurchaseEntries: PurchaseEntry[] = [
  {
    id: 'pe001',
    purchaseNumber: 'PUR2024001',
    supplierName: 'ABC Raw Materials Pvt. Ltd.',
    supplierPAN: '300123456',
    supplierAddress: 'Balaju Industrial Area, Kathmandu',
    purchaseDate: new Date('2024-08-25'),
    items: [
      {
        id: 'pi001',
        productName: 'Sodium Hydroxide',
        description: 'For soap manufacturing',
        quantity: 100,
        unitPrice: 450,
        totalPrice: 45000,
        vatApplicable: true
      },
      {
        id: 'pi002',
        productName: 'Coconut Oil',
        description: 'Premium grade',
        quantity: 50,
        unitPrice: 200,
        totalPrice: 10000,
        vatApplicable: true
      }
    ],
    subtotal: 55000,
    discountAmount: 0,
    taxableAmount: 55000,
    vatRate: 13,
    vatAmount: 7150,
    totalAmount: 62150,
    paymentMethod: 'credit',
    paymentStatus: 'pending',
    dueDate: new Date('2024-09-25'),
    notes: 'Quality materials for premium product line',
    enteredBy: '3',
    enteredAt: new Date('2024-08-25'),
    fiscalYear: '2024-25'
  },
  {
    id: 'pe002',
    purchaseNumber: 'PUR2024002',
    supplierName: 'Packaging Solutions Nepal',
    supplierPAN: '300654321',
    supplierAddress: 'Bhaktapur Industrial Estate',
    purchaseDate: new Date('2024-08-26'),
    items: [
      {
        id: 'pi003',
        productName: 'Plastic Bottles',
        description: '500ml capacity',
        quantity: 1000,
        unitPrice: 15,
        totalPrice: 15000,
        vatApplicable: true
      },
      {
        id: 'pi004',
        productName: 'Labels',
        description: 'Waterproof labels',
        quantity: 1000,
        unitPrice: 5,
        totalPrice: 5000,
        vatApplicable: true
      }
    ],
    subtotal: 20000,
    discountAmount: 1000,
    taxableAmount: 19000,
    vatRate: 13,
    vatAmount: 2470,
    totalAmount: 21470,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    enteredBy: '3',
    enteredAt: new Date('2024-08-26'),
    fiscalYear: '2024-25'
  }
];

// Mock Party Ledgers
export const mockPartyLedgers: PartyLedger[] = [
  {
    id: 'pl001',
    partyName: 'ABC Distribution Pvt. Ltd.',
    partyType: 'customer',
    panNumber: '300789123',
    address: 'Teku, Kathmandu',
    contactNumber: '9841111111',
    email: 'finance@abcdist.com',
    openingBalance: 25000,
    openingBalanceType: 'debit',
    currentBalance: 45000,
    creditLimit: 100000,
    transactions: [
      {
        id: 'pt001',
        date: new Date('2024-08-01'),
        description: 'Opening Balance',
        referenceNumber: 'OB2024',
        referenceType: 'adjustment',
        debitAmount: 25000,
        creditAmount: 0,
        balance: 25000,
        createdBy: '3',
        createdAt: new Date('2024-08-01')
      },
      {
        id: 'pt002',
        date: new Date('2024-08-15'),
        description: 'Sales Invoice - INV2024001',
        referenceNumber: 'INV2024001',
        referenceType: 'invoice',
        debitAmount: 56500,
        creditAmount: 0,
        balance: 81500,
        createdBy: '3',
        createdAt: new Date('2024-08-15')
      },
      {
        id: 'pt003',
        date: new Date('2024-08-20'),
        description: 'Payment Received',
        referenceNumber: 'REC2024001',
        referenceType: 'payment',
        debitAmount: 0,
        creditAmount: 36500,
        balance: 45000,
        createdBy: '3',
        createdAt: new Date('2024-08-20')
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-08-20')
  },
  {
    id: 'pl002',
    partyName: 'ABC Raw Materials Pvt. Ltd.',
    partyType: 'supplier',
    panNumber: '300123456',
    address: 'Balaju Industrial Area, Kathmandu',
    contactNumber: '9842222222',
    email: 'accounts@abcraw.com',
    openingBalance: 15000,
    openingBalanceType: 'credit',
    currentBalance: 77150,
    transactions: [
      {
        id: 'pt004',
        date: new Date('2024-08-01'),
        description: 'Opening Balance',
        referenceNumber: 'OB2024',
        referenceType: 'adjustment',
        debitAmount: 0,
        creditAmount: 15000,
        balance: -15000,
        createdBy: '3',
        createdAt: new Date('2024-08-01')
      },
      {
        id: 'pt005',
        date: new Date('2024-08-25'),
        description: 'Purchase - PUR2024001',
        referenceNumber: 'PUR2024001',
        referenceType: 'purchase',
        debitAmount: 0,
        creditAmount: 62150,
        balance: -77150,
        createdBy: '3',
        createdAt: new Date('2024-08-25')
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-08-25')
  }
];

// Mock Debtors and Creditors
export const mockDebtorsCreditors: DebtorsCreditors[] = [
  {
    id: 'dc001',
    partyName: 'ABC Distribution Pvt. Ltd.',
    partyType: 'debtor',
    panNumber: '300789123',
    contactNumber: '9841111111',
    outstandingAmount: 45000,
    overdueAmount: 0,
    agingBrackets: {
      current: 45000,
      thirtyDays: 0,
      sixtyDays: 0,
      ninetyDaysPlus: 0
    },
    lastTransactionDate: new Date('2024-08-20')
  },
  {
    id: 'dc002',
    partyName: 'XYZ Trading Company',
    partyType: 'debtor',
    panNumber: '300987654',
    contactNumber: '9842222222',
    outstandingAmount: 28500,
    overdueAmount: 12000,
    agingBrackets: {
      current: 16500,
      thirtyDays: 12000,
      sixtyDays: 0,
      ninetyDaysPlus: 0
    },
    lastTransactionDate: new Date('2024-07-15')
  },
  {
    id: 'dc003',
    partyName: 'ABC Raw Materials Pvt. Ltd.',
    partyType: 'creditor',
    panNumber: '300123456',
    contactNumber: '9843333333',
    outstandingAmount: 77150,
    overdueAmount: 0,
    agingBrackets: {
      current: 77150,
      thirtyDays: 0,
      sixtyDays: 0,
      ninetyDaysPlus: 0
    },
    lastTransactionDate: new Date('2024-08-25')
  },
  {
    id: 'dc004',
    partyName: 'Packaging Solutions Nepal',
    partyType: 'creditor',
    panNumber: '300654321',
    contactNumber: '9844444444',
    outstandingAmount: 0,
    overdueAmount: 0,
    agingBrackets: {
      current: 0,
      thirtyDays: 0,
      sixtyDays: 0,
      ninetyDaysPlus: 0
    },
    lastTransactionDate: new Date('2024-08-26')
  }
];

// Mock Purchase and Sales Report
export const mockPurchaseSalesReport: PurchaseSalesReport = {
  reportType: 'purchase',
  fromDate: new Date('2024-08-01'),
  toDate: new Date('2024-08-31'),
  summary: {
    totalAmount: 83620,
    totalVAT: 9620,
    totalTransactions: 2,
    averageTransactionValue: 41810
  },
  details: [
    {
      id: 'psd001',
      date: new Date('2024-08-25'),
      billNumber: 'PUR2024001',
      partyName: 'ABC Raw Materials Pvt. Ltd.',
      panNumber: '300123456',
      description: 'Raw materials for soap production',
      taxableAmount: 55000,
      vatAmount: 7150,
      totalAmount: 62150,
      billType: 'purchase'
    },
    {
      id: 'psd002',
      date: new Date('2024-08-26'),
      billNumber: 'PUR2024002',
      partyName: 'Packaging Solutions Nepal',
      panNumber: '300654321',
      description: 'Packaging materials',
      taxableAmount: 19000,
      vatAmount: 2470,
      totalAmount: 21470,
      billType: 'purchase'
    }
  ],
  vatSummary: {
    vatableAmount: 74000,
    exemptAmount: 0,
    totalVAT: 9620,
    vatRate: 13
  }
};

// Mock VAT Report (Nepal)
export const mockVATReport: VATReport = {
  fiscalYear: '2024-25',
  quarter: 1,
  fromDate: new Date('2024-07-16'),
  toDate: new Date('2024-10-15'),
  purchases: {
    taxablePurchases: 74000,
    inputVAT: 9620,
    exemptPurchases: 0,
    totalPurchases: 83620
  },
  sales: {
    taxableSales: 125000,
    outputVAT: 16250,
    exemptSales: 0,
    totalSales: 141250
  },
  vatSummary: {
    outputVAT: 16250,
    inputVAT: 9620,
    netVATPayable: 6630
  },
  monthlyBreakdown: [
    {
      month: 'Shrawan 2081',
      taxablePurchases: 25000,
      inputVAT: 3250,
      taxableSales: 42000,
      outputVAT: 5460,
      netVAT: 2210
    },
    {
      month: 'Bhadra 2081',
      taxablePurchases: 49000,
      inputVAT: 6370,
      taxableSales: 58000,
      outputVAT: 7540,
      netVAT: 1170
    },
    {
      month: 'Ashwin 2081',
      taxablePurchases: 0,
      inputVAT: 0,
      taxableSales: 25000,
      outputVAT: 3250,
      netVAT: 3250
    }
  ]
};

// Mock Trial Balance
export const mockTrialBalance: TrialBalance = {
  asOfDate: new Date('2024-08-31'),
  accounts: [
    {
      accountCode: '1000',
      accountName: 'Cash',
      accountType: 'asset',
      debitBalance: 150000,
      creditBalance: 0
    },
    {
      accountCode: '1100',
      accountName: 'Accounts Receivable',
      accountType: 'asset',
      debitBalance: 73500,
      creditBalance: 0
    },
    {
      accountCode: '1150',
      accountName: 'VAT Receivable',
      accountType: 'asset',
      debitBalance: 9620,
      creditBalance: 0
    },
    {
      accountCode: '1200',
      accountName: 'Inventory',
      accountType: 'asset',
      debitBalance: 125000,
      creditBalance: 0
    },
    {
      accountCode: '1500',
      accountName: 'Plant & Equipment',
      accountType: 'asset',
      debitBalance: 500000,
      creditBalance: 0
    },
    {
      accountCode: '2000',
      accountName: 'Accounts Payable',
      accountType: 'liability',
      debitBalance: 0,
      creditBalance: 77150
    },
    {
      accountCode: '2100',
      accountName: 'VAT Payable',
      accountType: 'liability',
      debitBalance: 0,
      creditBalance: 16250
    },
    {
      accountCode: '3000',
      accountName: 'Capital',
      accountType: 'equity',
      debitBalance: 0,
      creditBalance: 500000
    },
    {
      accountCode: '4000',
      accountName: 'Sales Revenue',
      accountType: 'revenue',
      debitBalance: 0,
      creditBalance: 125000
    },
    {
      accountCode: '5000',
      accountName: 'Cost of Goods Sold',
      accountType: 'expense',
      debitBalance: 74000,
      creditBalance: 0
    },
    {
      accountCode: '6000',
      accountName: 'Operating Expenses',
      accountType: 'expense',
      debitBalance: 45280,
      creditBalance: 0
    }
  ],
  totals: {
    totalDebits: 977400,
    totalCredits: 718400,
    isBalanced: false
  },
  generatedBy: '3',
  generatedAt: new Date('2024-08-31')
};

// Mock Balance Sheet
export const mockBalanceSheet: BalanceSheet = {
  asOfDate: new Date('2024-08-31'),
  assets: {
    currentAssets: [
      {
        accountCode: '1000',
        accountName: 'Cash',
        amount: 150000,
        previousYearAmount: 120000,
        percentChange: 25
      },
      {
        accountCode: '1100',
        accountName: 'Accounts Receivable',
        amount: 73500,
        previousYearAmount: 65000,
        percentChange: 13
      },
      {
        accountCode: '1150',
        accountName: 'VAT Receivable',
        amount: 9620,
        previousYearAmount: 8500,
        percentChange: 13
      },
      {
        accountCode: '1200',
        accountName: 'Inventory',
        amount: 125000,
        previousYearAmount: 95000,
        percentChange: 32
      }
    ],
    fixedAssets: [
      {
        accountCode: '1500',
        accountName: 'Plant & Equipment',
        amount: 500000,
        previousYearAmount: 500000,
        percentChange: 0
      },
      {
        accountCode: '1550',
        accountName: 'Accumulated Depreciation',
        amount: -50000,
        previousYearAmount: -25000,
        percentChange: 100
      }
    ],
    totalCurrentAssets: 358120,
    totalFixedAssets: 450000,
    totalAssets: 808120
  },
  liabilities: {
    currentLiabilities: [
      {
        accountCode: '2000',
        accountName: 'Accounts Payable',
        amount: 77150,
        previousYearAmount: 65000,
        percentChange: 19
      },
      {
        accountCode: '2100',
        accountName: 'VAT Payable',
        amount: 16250,
        previousYearAmount: 12000,
        percentChange: 35
      },
      {
        accountCode: '2200',
        accountName: 'Accrued Expenses',
        amount: 25000,
        previousYearAmount: 20000,
        percentChange: 25
      }
    ],
    longTermLiabilities: [
      {
        accountCode: '2500',
        accountName: 'Long Term Loan',
        amount: 200000,
        previousYearAmount: 250000,
        percentChange: -20
      }
    ],
    totalCurrentLiabilities: 118400,
    totalLongTermLiabilities: 200000,
    totalLiabilities: 318400
  },
  equity: {
    items: [
      {
        accountCode: '3000',
        accountName: 'Share Capital',
        amount: 400000,
        previousYearAmount: 400000,
        percentChange: 0
      },
      {
        accountCode: '3100',
        accountName: 'Retained Earnings',
        amount: 89720,
        previousYearAmount: 65000,
        percentChange: 38
      }
    ],
    totalEquity: 489720
  },
  isBalanced: true,
  generatedBy: '3',
  generatedAt: new Date('2024-08-31')
};

// Mock MIS Report
export const mockMISReport: MISReport = {
  reportDate: new Date('2024-08-31'),
  reportPeriod: {
    fromDate: new Date('2024-08-01'),
    toDate: new Date('2024-08-31'),
    periodType: 'monthly'
  },
  financialMetrics: {
    grossRevenue: 125000,
    netRevenue: 125000,
    grossProfit: 51000,
    operatingExpenses: 45280,
    operatingProfit: 5720,
    netProfit: 5720,
    grossProfitMargin: 40.8,
    operatingProfitMargin: 4.6,
    netProfitMargin: 4.6
  },
  keyRatios: {
    currentRatio: 3.02,
    quickRatio: 1.97,
    debtToEquityRatio: 0.65,
    returnOnAssets: 8.5,
    returnOnEquity: 14.0,
    inventoryTurnover: 7.2,
    receivablesTurnover: 20.4
  },
  cashFlow: {
    operatingCashFlow: 25000,
    investingCashFlow: -15000,
    financingCashFlow: -5000,
    netCashFlow: 5000,
    cashBalance: 150000
  },
  comparison: {
    previousPeriod: {
      revenue: 115000,
      expenses: 98500,
      profit: 16500,
      profitMargin: 14.3,
      variance: -10780,
      variancePercentage: -65.3
    },
    yearToDate: {
      revenue: 980000,
      expenses: 845600,
      profit: 134400,
      profitMargin: 13.7,
      variance: -128680,
      variancePercentage: -95.7
    },
    budget: {
      revenue: 130000,
      expenses: 110000,
      profit: 20000,
      profitMargin: 15.4,
      variance: -14280,
      variancePercentage: -71.4
    }
  }
};
