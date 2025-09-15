import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateUser() {
  try {
    console.log('🔄 Activating manager account...');
    
    // Update the manager account to be active
    const updatedUser = await prisma.user.update({
      where: { email: 'manager@gharsamma.com' },
      data: { isActive: true }
    });

    console.log('✅ Manager account activated successfully!');
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`👤 Username: ${updatedUser.username}`);
    console.log(`🎭 Role: ${updatedUser.role}`);
    console.log(`🟢 Status: ${updatedUser.isActive ? 'Active' : 'Inactive'}`);
    
  } catch (error) {
    console.error('❌ Error activating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

activateUser();










