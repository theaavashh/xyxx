import { PrismaClient } from '@prisma/client';

// Global variable to store Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client instance
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty'
  });
};

// Use global variable in development to prevent multiple instances
const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Database connection helper
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ डाटाबेस सफलतापूर्वक जडान भयो');
  } catch (error) {
    console.error('❌ डाटाबेस जडान त्रुटि:', error);
    process.exit(1);
  }
};

// Database disconnection helper
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✅ डाटाबेस जडान बन्द भयो');
  } catch (error) {
    console.error('❌ डाटाबेस बन्द गर्दा त्रुटि:', error);
  }
};

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('डाटाबेस स्वास्थ्य जाँच असफल:', error);
    return false;
  }
};

// Graceful shutdown handler
export const gracefulShutdown = async (): Promise<void> => {
  console.log('🔄 Graceful shutdown initiated...');
  
  try {
    await disconnectDatabase();
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle process termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);

export default prisma;
