import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/*
* Script to create an Accountant user
*/
async function createAccountant() {
  try {
    console.log('🚀 Creating Accountant user...');

    // Accountant data
    const accountantData = {
      fullName: 'John Accountant',
      email: 'accountant@gharsamma.com',
      username: 'accountant',
      password: 'accountant123',
      address: 'Kathmandu, Nepal',
      department: 'Finance',
      position: 'Accountant'
    };

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: accountantData.email }
    });

    if (existingUser) {
      console.log(`❌ User with email ${accountantData.email} already exists!`);
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
      where: { username: accountantData.username }
    });

    if (existingUsername) {
      console.log(`❌ Username ${accountantData.username} already exists!`);
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(accountantData.password, saltRounds);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email: accountantData.email,
        username: accountantData.username,
        fullName: accountantData.fullName,
        password: hashedPassword,
        address: accountantData.address,
        department: accountantData.department,
        position: accountantData.position,
        role: 'MANAGERIAL', // Managerial role for accountant
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

    console.log('✅ Accountant created successfully!');
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
    console.log(`📧 Email: ${accountantData.email}`);
    console.log(`👤 Username: ${accountantData.username}`);
    console.log(`🔑 Password: ${accountantData.password}`);

    console.log('\n🌐 Access URLs:');
    console.log('Admin Panel: http://localhost:3000');
    console.log('Distributor Portal: http://localhost:3001');

  } catch (error) {
    console.error('❌ Error creating Accountant:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAccountant();

export { createAccountant };


