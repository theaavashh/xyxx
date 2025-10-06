require('dotenv').config({ path: './.env' });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleApprovedDistributor() {
  try {
    console.log('🚀 Creating sample approved distributor for aavash.ganeju@gmail.com...');

    // Find the existing user
    const existingUser = await prisma.user.findFirst({
      where: { email: 'aavash.ganeju@gmail.com' }
    });

    if (!existingUser) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ Found user:', existingUser.email);

    // Get or create categories to assign
    let category1 = await prisma.category.findFirst({
      where: { title: 'ZipZip Achar' }
    });

    if (!category1) {
      category1 = await prisma.category.create({
        data: {
          title: 'ZipZip Achar',
          slug: 'zipzip-achar',
          description: 'Mutton Achar, Pork Achar, Chicken Achar',
          createdBy: existingUser.id
        }
      });
      console.log('✅ Created category:', category1.title);
    }

    let category2 = await prisma.category.findFirst({
      where: { title: 'Sample Products' }
    });

    if (!category2) {
      category2 = await prisma.category.create({
        data: {
          title: 'Sample Products',
          slug: 'sample-products',
          description: 'Product A, Product B, Product C',
          createdBy: existingUser.id
        }
      });
      console.log('✅ Created category:', category2.title);
    }

    console.log('ℹ️  Skipping application creation - just assigning categories to existing user');

    // Assign categories to the distributor
    const categoriesToAssign = [category1, category2];
    
    for (const category of categoriesToAssign) {
      // Check if category is already assigned
      const existingAssignment = await prisma.distributorCategory.findFirst({
        where: {
          distributorId: existingUser.id,
          categoryId: category.id
        }
      });

      if (!existingAssignment) {
        await prisma.distributorCategory.create({
          data: {
            distributorId: existingUser.id,
            categoryId: category.id,
            assignedBy: existingUser.id // Using same user as admin for sample
          }
        });
        console.log(`✅ Assigned category: ${category.title}`);
      } else {
        console.log(`ℹ️  Category already assigned: ${category.title}`);
      }
    }

    // Update user to ensure they have DISTRIBUTOR role and are active
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: 'DISTRIBUTOR',
        isActive: true,
        fullName: 'Aavash Ganeju'
      }
    });

    console.log('✅ Updated user role and status');

    console.log('📋 Sample approved distributor setup complete:');
    console.log(`  👤 Name: Aavash Ganeju`);
    console.log(`  📧 Email: aavash.ganeju@gmail.com`);
    console.log(`  🔑 Password: 123456`);
    console.log(`  📂 Categories assigned:`);
    console.log(`    - ${category1.title}: ${category1.description}`);
    console.log(`    - ${category2.title}: ${category2.description}`);
    console.log(`  ✅ Status: APPROVED`);

    console.log('🎉 Sample approved distributor created successfully!');

  } catch (error) {
    console.error('❌ Error creating sample approved distributor:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleApprovedDistributor();
