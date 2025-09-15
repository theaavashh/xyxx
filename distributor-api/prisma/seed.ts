import { PrismaClient, AccountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@distributor.com' },
    update: {},
    create: {
      email: 'admin@distributor.com',
      username: 'admin',
      fullName: 'System Administrator',
      password: adminPassword,
      address: 'Kathmandu, Nepal',
      department: 'IT',
      position: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
      verifiedAt: new Date(),
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sales manager
  const managerPassword = await bcrypt.hash('manager123', 10);
  const salesManager = await prisma.user.upsert({
    where: { email: 'sales.manager@distributor.com' },
    update: {},
    create: {
      email: 'sales.manager@distributor.com',
      username: 'sales.manager',
      fullName: 'Sales Manager',
      password: managerPassword,
      address: 'Kathmandu, Nepal',
      department: 'Sales',
      position: 'Sales Manager',
      role: 'SALES_MANAGER',
      isActive: true,
      isVerified: true,
      verifiedAt: new Date(),
    },
  });
  console.log('✅ Sales Manager created:', salesManager.email);

  // Create sales representative
  const salesPassword = await bcrypt.hash('sales123', 10);
  const salesRep = await prisma.user.upsert({
    where: { email: 'sales.rep@distributor.com' },
    update: {},
    create: {
      email: 'sales.rep@distributor.com',
      username: 'sales.rep',
      fullName: 'Sales Representative',
      password: salesPassword,
      address: 'Kathmandu, Nepal',
      department: 'Sales',
      position: 'Sales Representative',
      role: 'SALES_REPRESENTATIVE',
      isActive: true,
      isVerified: true,
      verifiedAt: new Date(),
    },
  });
  console.log('✅ Sales Representative created:', salesRep.email);

  // Create sample accounts for accounting
  console.log('🌱 Creating sample accounts...');
  
  const accounts = [
    // Assets (1000-1999)
    { code: '1000', name: 'Cash', type: AccountType.ASSET, description: 'Cash on hand and in bank' },
    { code: '1100', name: 'Accounts Receivable', type: AccountType.ASSET, description: 'Amounts owed by customers' },
    { code: '1200', name: 'Inventory', type: AccountType.ASSET, description: 'Raw materials and finished goods' },
    { code: '1300', name: 'Prepaid Expenses', type: AccountType.ASSET, description: 'Expenses paid in advance' },
    { code: '1400', name: 'Fixed Assets', type: AccountType.ASSET, description: 'Buildings, equipment, vehicles' },
    { code: '1500', name: 'Accumulated Depreciation', type: AccountType.ASSET, description: 'Depreciation on fixed assets' },
    
    // Liabilities (2000-2999)
    { code: '2000', name: 'Accounts Payable', type: AccountType.LIABILITY, description: 'Amounts owed to suppliers' },
    { code: '2100', name: 'Accrued Expenses', type: AccountType.LIABILITY, description: 'Expenses incurred but not paid' },
    { code: '2200', name: 'Short-term Loans', type: AccountType.LIABILITY, description: 'Bank loans due within one year' },
    { code: '2300', name: 'VAT Payable', type: AccountType.LIABILITY, description: 'Value Added Tax collected' },
    { code: '2400', name: 'Income Tax Payable', type: AccountType.LIABILITY, description: 'Income tax liability' },
    
    // Equity (3000-3999)
    { code: '3000', name: 'Owner\'s Capital', type: AccountType.EQUITY, description: 'Owner investment in business' },
    { code: '3100', name: 'Retained Earnings', type: AccountType.EQUITY, description: 'Accumulated profits/losses' },
    { code: '3200', name: 'Current Year Earnings', type: AccountType.EQUITY, description: 'Current year profit/loss' },
    
    // Revenue (4000-4999)
    { code: '4000', name: 'Sales Revenue', type: AccountType.REVENUE, description: 'Revenue from product sales' },
    { code: '4100', name: 'Service Revenue', type: AccountType.REVENUE, description: 'Revenue from services' },
    { code: '4200', name: 'Interest Income', type: AccountType.REVENUE, description: 'Interest earned on investments' },
    { code: '4300', name: 'Other Income', type: AccountType.REVENUE, description: 'Miscellaneous income' },
    
    // Expenses (5000-5999)
    { code: '5000', name: 'Cost of Goods Sold', type: AccountType.EXPENSE, description: 'Direct costs of products sold' },
    { code: '5100', name: 'Salaries and Wages', type: AccountType.EXPENSE, description: 'Employee compensation' },
    { code: '5200', name: 'Rent Expense', type: AccountType.EXPENSE, description: 'Office and warehouse rent' },
    { code: '5300', name: 'Utilities', type: AccountType.EXPENSE, description: 'Electricity, water, internet' },
    { code: '5400', name: 'Office Supplies', type: AccountType.EXPENSE, description: 'Office materials and supplies' },
    { code: '5500', name: 'Transportation', type: AccountType.EXPENSE, description: 'Fuel, maintenance, delivery costs' },
    { code: '5600', name: 'Marketing and Advertising', type: AccountType.EXPENSE, description: 'Promotional expenses' },
    { code: '5700', name: 'Insurance', type: AccountType.EXPENSE, description: 'Business insurance premiums' },
    { code: '5800', name: 'Depreciation', type: AccountType.EXPENSE, description: 'Depreciation on fixed assets' },
    { code: '5900', name: 'Interest Expense', type: AccountType.EXPENSE, description: 'Interest on loans' },
  ];

  for (const accountData of accounts) {
    await prisma.account.upsert({
      where: { code: accountData.code },
      update: {},
      create: accountData,
    });
  }
  console.log(`✅ Created ${accounts.length} sample accounts`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Default Users Created:');
  console.log('Admin:', admin.email, '/ admin123');
  console.log('Sales Manager:', salesManager.email, '/ manager123');
  console.log('Sales Rep:', salesRep.email, '/ sales123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
