require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignTestCategories() {
  try {
    console.log('🚀 Assigning test categories to distributor...');

    // Get the test distributor
    const distributor = await prisma.user.findFirst({
      where: { email: 'distributor@test.com' }
    });

    if (!distributor) {
      console.log('❌ Test distributor not found');
      return;
    }

    console.log('✅ Found test distributor:', distributor.email);

    // Get or create test categories
    let category1 = await prisma.category.findFirst({
      where: { title: 'ZipZip Achar' }
    });

    if (!category1) {
      category1 = await prisma.category.create({
        data: {
          title: 'ZipZip Achar',
          slug: 'zipzip-achar',
          description: 'Mutton Achar, Pork Achar, Chicken Achar',
          createdBy: distributor.id
        }
      });
      console.log('✅ Created category:', category1.title);
    }

    let category2 = await prisma.category.findFirst({
      where: { title: 'Test Products' }
    });

    if (!category2) {
      category2 = await prisma.category.create({
        data: {
          title: 'Test Products',
          slug: 'test-products',
          description: 'Sample Product 1, Sample Product 2',
          createdBy: distributor.id
        }
      });
      console.log('✅ Created category:', category2.title);
    }

    // Assign categories to distributor using DistributorCategory model
    const categoriesToAssign = [category1, category2];
    
    for (const category of categoriesToAssign) {
      // Check if category is already assigned
      const existingAssignment = await prisma.distributorCategory.findFirst({
        where: {
          distributorId: distributor.id,
          categoryId: category.id
        }
      });

      if (!existingAssignment) {
        await prisma.distributorCategory.create({
          data: {
            distributorId: distributor.id,
            categoryId: category.id,
            assignedBy: distributor.id // Using distributor as admin for test
          }
        });
        console.log(`✅ Assigned category: ${category.title}`);
      } else {
        console.log(`ℹ️  Category already assigned: ${category.title}`);
      }
    }

    console.log('📋 Categories assigned to distributor:');
    console.log(`  - ${category1.title}: ${category1.description}`);
    console.log(`  - ${category2.title}: ${category2.description}`);

    console.log('🎉 Test categories assigned successfully!');

  } catch (error) {
    console.error('❌ Error assigning categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignTestCategories();
