import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/*
* Script to create a Sales Manager user
*/
async function createSalesManager() {
  try {
    console.log('🚀 Creating Sales Manager user...');

    // Sales Manager data
    const salesManagerData = {
      fullName: 'John Sales Manager',
      email: 'sales.manager@gharsamma.com',
      username: 'sales_manager',
      password: 'sales123',
      address: 'Kathmandu, Nepal',
      department: 'Sales',
      position: 'Sales Manager'
    };

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: salesManagerData.email }
    });

    if (existingUser) {
      console.log(`❌ User with email ${salesManagerData.email} already exists!`);
      console.log('📧 Existing user details:', {
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role,
        isActive: existingUser.isActive
      });
      return;
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: salesManagerData.username }
    });

    if (existingUsername) {
      console.log(`❌ Username ${salesManagerData.username} already exists!`);
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(salesManagerData.password, saltRounds);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email: salesManagerData.email,
        username: salesManagerData.username,
        fullName: salesManagerData.fullName,
        password: hashedPassword,
        address: salesManagerData.address,
        department: salesManagerData.department,
        position: salesManagerData.position,
        role: 'SALES_MANAGER', // Sales Manager role
        isActive: true,
        isVerified: true
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        address: true,
        department: true,
        position: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true
      }
    });

    console.log('✅ Sales Manager created successfully!');
    console.log('👤 User Details:', {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      department: newUser.department,
      position: newUser.position,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    });

    console.log('\n🔐 Login Credentials:');
    console.log(`📧 Email: ${salesManagerData.email}`);
    console.log(`👤 Username: ${salesManagerData.username}`);
    console.log(`🔑 Password: ${salesManagerData.password}`);

    console.log('\n🌐 Access URLs:');
    console.log('Admin Panel: http://localhost:3000');
    console.log('Distributor Portal: http://localhost:3001');

  } catch (error) {
    console.error('❌ Error creating Sales Manager:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createSalesManager();

export { createSalesManager };
