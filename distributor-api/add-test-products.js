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
          description: 'Test products for distributor testing',
          slug: 'test-category',
          createdBy: 'cmf6frns10001ltxshkip9u52' // Sales manager user ID
        }
      });
      console.log('✅ Created test category:', category.title);
    }

    // Add test products
    const testProducts = [
      {
        name: 'Buff Achar',
        slug: 'buff-achar',
        description: 'Delicious buffalo meat pickle - 500gm plastic bottle',
        price: 575,
        costPrice: 500,
        stockQuantity: 100,
        brand: 'ZipZip',
        size: '500gm',
        categoryId: category.id,
        createdBy: 'cmf6frns10001ltxshkip9u52' // Sales manager user ID
      },
      {
        name: 'Pork Achar',
        slug: 'pork-achar',
        description: 'Tasty pork meat pickle - 250gm glass jar',
        price: 350,
        costPrice: 300,
        stockQuantity: 75,
        brand: 'ZipZip',
        size: '250gm',
        categoryId: category.id,
        createdBy: 'cmf6frns10001ltxshkip9u52' // Sales manager user ID
      },
      {
        name: 'Chicken Achar',
        slug: 'chicken-achar',
        description: 'Flavorful chicken meat pickle - 1kg plastic container',
        price: 1000,
        costPrice: 900,
        stockQuantity: 50,
        brand: 'ZipZip',
        size: '1kg',
        categoryId: category.id,
        createdBy: 'cmf6frns10001ltxshkip9u52' // Sales manager user ID
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












