import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/*
* Script to create a Production Manager user
*/
async function createProductionManager() {
  try {
    console.log('🚀 Creating Production Manager user...');

    // Production Manager data
    const productionManagerData = {
      fullName: 'John Production Manager',
      email: 'production.manager@gharsamma.com',
      username: 'production_manager',
      password: 'production123',
      address: 'Kathmandu, Nepal',
      department: 'Production',
      position: 'Production Manager'
    };

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: productionManagerData.email }
    });

    if (existingUser) {
      console.log(`❌ User with email ${productionManagerData.email} already exists!`);
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
      where: { username: productionManagerData.username }
    });

    if (existingUsername) {
      console.log(`❌ Username ${productionManagerData.username} already exists!`);
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(productionManagerData.password, saltRounds);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email: productionManagerData.email,
        username: productionManagerData.username,
        fullName: productionManagerData.fullName,
        password: hashedPassword,
        address: productionManagerData.address,
        department: productionManagerData.department,
        position: productionManagerData.position,
        role: 'MANAGERIAL', // Managerial role for production manager
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

    console.log('✅ Production Manager created successfully!');
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
    console.log(`📧 Email: ${productionManagerData.email}`);
    console.log(`👤 Username: ${productionManagerData.username}`);
    console.log(`🔑 Password: ${productionManagerData.password}`);

    console.log('\n🌐 Access URLs:');
    console.log('Admin Panel: http://localhost:3000');
    console.log('Distributor Portal: http://localhost:3001');

  } catch (error) {
    console.error('❌ Error creating Production Manager:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createProductionManager();

export { createProductionManager };


