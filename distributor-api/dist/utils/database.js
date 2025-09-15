"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = exports.checkDatabaseHealth = exports.disconnectDatabase = exports.connectDatabase = void 0;
const client_1 = require("@prisma/client");
const createPrismaClient = () => {
    return new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: 'pretty'
    });
};
const prisma = globalThis.__prisma || createPrismaClient();
if (process.env.NODE_ENV === 'development') {
    globalThis.__prisma = prisma;
}
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('✅ डाटाबेस सफलतापूर्वक जडान भयो');
    }
    catch (error) {
        console.error('❌ डाटाबेस जडान त्रुटि:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await prisma.$disconnect();
        console.log('✅ डाटाबेस जडान बन्द भयो');
    }
    catch (error) {
        console.error('❌ डाटाबेस बन्द गर्दा त्रुटि:', error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
const checkDatabaseHealth = async () => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error('डाटाबेस स्वास्थ्य जाँच असफल:', error);
        return false;
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
const gracefulShutdown = async () => {
    console.log('🔄 Graceful shutdown initiated...');
    try {
        await (0, exports.disconnectDatabase)();
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
    }
};
exports.gracefulShutdown = gracefulShutdown;
process.on('SIGINT', exports.gracefulShutdown);
process.on('SIGTERM', exports.gracefulShutdown);
process.on('beforeExit', exports.gracefulShutdown);
exports.default = prisma;
//# sourceMappingURL=database.js.map