require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestProducts() {
  try {
    console.log('🚀 Adding test products...');

    // Check if products already exist
    const existingProducts = await prisma.product.findMany();
    if (existingProducts.length > 0) {
      console.log('✅ Test products already exist:', existingProducts.length, 'products');
      existingProducts.forEach(product => {
        console.log(`- ${product.name} (${product.category})`);
      });
      return;
    }

    // Get or create test category
    let category = await prisma.category.findFirst({
      where: { title: 'Test Category' }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          title: 'Test Category',
          description: 'Test products for distributor testing'
        }
      });
      console.log('✅ Created test category:', category.title);
    }

    // Add test products
    const testProducts = [
      {
        name: 'Buff Achar',
        units: '500gm',
        packaging: 'Plastic Bottle',
        distributorPrice: 500,
        wholesalePrice: 525,
        rate: 575,
        mrp: 700,
        categoryId: category.id
      },
      {
        name: 'Pork Achar',
        units: '250gm',
        packaging: 'Glass Jar',
        distributorPrice: 300,
        wholesalePrice: 320,
        rate: 350,
        mrp: 400,
        categoryId: category.id
      },
      {
        name: 'Chicken Achar',
        units: '1kg',
        packaging: 'Plastic Container',
        distributorPrice: 900,
        wholesalePrice: 950,
        rate: 1000,
        mrp: 1100,
        categoryId: category.id
      }
    ];

    for (const productData of testProducts) {
      const product = await prisma.product.create({
        data: productData
      });
      console.log('✅ Created product:', product.name);
    }

    console.log('🎉 All test products created successfully!');

  } catch (error) {
    console.error('❌ Error adding test products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestProducts();











