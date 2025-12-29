require('dotenv').config({ path: './.env' });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestDistributor() {
  try {
    console.log('🚀 Creating test distributor...');

    // Check if test distributor already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'distributor@test.com' },
          { username: 'testdistributor' }
        ]
      }
    });

    if (existingUser) {
      console.log('✅ Test distributor already exists:', existingUser.email);
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Username:', existingUser.username);
      console.log('🔑 Password: test123456');
      console.log('🆔 User ID:', existingUser.id);
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('test123456', saltRounds);

    // Create test distributor user
    const user = await prisma.user.create({
      data: {
        email: 'distributor@test.com',
        username: 'testdistributor',
        fullName: 'Test Distributor',
        password: hashedPassword,
        role: 'DISTRIBUTOR',
        isActive: true,
        address: 'Test Address, Kathmandu, Nepal',
        department: 'Distribution',
        position: 'Distributor'
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    console.log('✅ Test distributor created successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Username:', user.username);
    console.log('🔑 Password: test123456');
    console.log('🆔 User ID:', user.id);
    console.log('📅 Created:', user.createdAt);

  } catch (error) {
    console.error('❌ Error creating test distributor:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestDistributor();

















