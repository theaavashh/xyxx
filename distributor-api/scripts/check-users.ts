#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking for users in the database...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        department: true,
        position: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in the database.');
      console.log('\n💡 To create an admin user, run:');
      console.log('   npm run create-admin');
    } else {
      console.log(`✅ Found ${users.length} user(s) in the database:\n`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. User Details:`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Username: ${user.username}`);
        console.log(`   - Full Name: ${user.fullName}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Department: ${user.department}`);
        console.log(`   - Position: ${user.position}`);
        console.log(`   - Status: ${user.isActive ? '🟢 Active' : '🔴 Inactive'}`);
        console.log(`   - Created: ${user.createdAt.toLocaleString()}`);
        console.log(`   - Updated: ${user.updatedAt.toLocaleString()}`);
        console.log('');
      });

      // Count by role
      const roleStats = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('📊 Users by Role:');
      Object.entries(roleStats).forEach(([role, count]) => {
        console.log(`   - ${role}: ${count} user(s)`);
      });

      // Count active/inactive
      const activeCount = users.filter(u => u.isActive).length;
      const inactiveCount = users.length - activeCount;
      
      console.log('\n📈 User Status:');
      console.log(`   - Active: ${activeCount} user(s)`);
      console.log(`   - Inactive: ${inactiveCount} user(s)`);

      // Show admin panel access
      const adminUsers = users.filter(u => 
        ['ADMIN', 'MANAGERIAL', 'SALES_MANAGER'].includes(u.role) && u.isActive
      );
      
      console.log('\n🔐 Admin Panel Access:');
      if (adminUsers.length > 0) {
        console.log(`   ✅ ${adminUsers.length} user(s) can access the admin panel:`);
        adminUsers.forEach(user => {
          console.log(`      - ${user.fullName} (${user.email}) - ${user.role}`);
        });
      } else {
        console.log('   ❌ No users with admin panel access found.');
        console.log('   💡 Create an admin user with: npm run create-admin');
      }
    }

    console.log('\n🌐 Admin Panel URL: http://localhost:3001');
    console.log('🗄️  Prisma Studio URL: http://localhost:5555');

  } catch (error) {
    console.error('❌ Error checking users:', error);
    
    if (error instanceof Error && error.message.includes('connect')) {
      console.log('\n💡 Database connection failed. Make sure:');
      console.log('   1. PostgreSQL is running');
      console.log('   2. DATABASE_URL is correct in .env file');
      console.log('   3. Database exists and is accessible');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n\nScript interrupted. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  checkUsers().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export { checkUsers };


