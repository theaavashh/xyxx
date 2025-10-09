require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Checking for user: aavash.ganeju@gmail.com');

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: { email: 'aavash.ganeju@gmail.com' },
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

    if (!user) {
      console.log('❌ User not found: aavash.ganeju@gmail.com');
      return;
    }

    console.log('✅ User found:');
    console.log(`  - ID: ${user.id}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Username: ${user.username}`);
    console.log(`  - Full Name: ${user.fullName}`);
    console.log(`  - Role: ${user.role}`);
    console.log(`  - Active: ${user.isActive}`);
    console.log(`  - Created: ${user.createdAt}`);

    // Check assigned categories
    const assignedCategories = await prisma.distributorCategory.findMany({
      where: { distributorId: user.id },
      include: {
        category: {
          select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            isActive: true
          }
        }
      }
    });

    console.log(`\n📋 Assigned Categories (${assignedCategories.length}):`);
    if (assignedCategories.length === 0) {
      console.log('  - No categories assigned');
    } else {
      assignedCategories.forEach((ac, index) => {
        console.log(`  ${index + 1}. ${ac.category.title}`);
        console.log(`     Description: ${ac.category.description || 'No description'}`);
        console.log(`     Assigned at: ${ac.assignedAt}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();












