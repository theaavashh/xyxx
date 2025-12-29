#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
};

async function deleteAllUsers() {
  try {
    console.log('🚨 WARNING: DELETE ALL USERS 🚨\n');
    console.log('This action will permanently delete ALL users from the database.');
    console.log('This action CANNOT be undone!\n');

    // First, check if there are any users
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('ℹ️  No users found in the database. Nothing to delete.');
      return;
    }

    // Show current users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true
      }
    });

    console.log(`📊 Found ${userCount} user(s) in the database:\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email}) - ${user.role} - ${user.isActive ? 'Active' : 'Inactive'}`);
    });

    console.log('\n⚠️  This will delete:');
    console.log(`   - ${userCount} user accounts`);
    console.log('   - All related authentication data');
    console.log('   - All user sessions will be invalidated');

    // Confirmation prompts
    console.log('\n🔐 Security Check:');
    
    const confirm1 = await prompt('Are you absolutely sure you want to delete ALL users? (yes/no): ');
    if (confirm1 !== 'yes') {
      console.log('❌ Operation cancelled by user.');
      return;
    }

    const confirm2 = await prompt('Type "DELETE ALL USERS" to confirm this destructive action: ');
    if (confirm2 !== 'delete all users') {
      console.log('❌ Confirmation text does not match. Operation cancelled.');
      return;
    }

    const finalConfirm = await prompt('This is your FINAL warning. Type "I UNDERSTAND" to proceed: ');
    if (finalConfirm !== 'i understand') {
      console.log('❌ Final confirmation failed. Operation cancelled.');
      return;
    }

    console.log('\n🗑️  Deleting all users...');

    // Delete users in a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // First, delete any related data that might reference users
      // Note: Prisma will handle cascade deletes based on schema relationships
      
      // Delete all users
      const deletedUsers = await tx.user.deleteMany({});
      
      return deletedUsers;
    });

    console.log(`✅ Successfully deleted ${result.count} user(s) from the database.`);
    console.log('\n📋 Summary:');
    console.log(`   - Users deleted: ${result.count}`);
    console.log('   - All user sessions invalidated');
    console.log('   - Database is now clean of user data');
    
    console.log('\n💡 Next Steps:');
    console.log('   - To create a new admin user: npm run create-admin');
    console.log('   - To check current users: npm run check-users');
    console.log('   - Admin panel will require new authentication');

  } catch (error) {
    console.error('\n❌ Error deleting users:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        console.log('\n💡 Foreign key constraint error:');
        console.log('   - Some users might be referenced by other data');
        console.log('   - Check for distributor applications or other related records');
        console.log('   - You may need to delete related data first');
      } else if (error.message.includes('connect')) {
        console.log('\n💡 Database connection failed:');
        console.log('   - Make sure PostgreSQL is running');
        console.log('   - Verify DATABASE_URL in .env file');
        console.log('   - Check database connectivity');
      }
    }
    
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n\nScript interrupted by user. Cleaning up...');
  rl.close();
  await prisma.$disconnect();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  deleteAllUsers().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export { deleteAllUsers };









































