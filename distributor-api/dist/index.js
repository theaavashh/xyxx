"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const error_middleware_1 = require("./middleware/error.middleware");
const rate_limit_middleware_1 = require("./middleware/rate-limit.middleware");
const routes_1 = __importDefault(require("./routes"));
const database_1 = require("./utils/database");
const logger_1 = __importDefault(require("./utils/logger"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1);
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.ADMIN_PANEL_URL || 'http://localhost:3002',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400
};
app.use((0, cors_1.default)(corsOptions));
app.use(rate_limit_middleware_1.generalLimiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
const morganFormat = process.env.NODE_ENV === 'production'
    ? 'combined'
    : ':method :url :status :res[content-length] - :response-time ms';
app.use((0, morgan_1.default)(morganFormat, {
    stream: {
        write: (message) => {
            const parts = message.trim().split(' ');
            if (parts.length >= 4) {
                const method = parts[0];
                const url = parts[1];
                const status = parseInt(parts[2]);
                const responseTime = parseFloat(parts[parts.length - 2]);
                logger_1.default.request(method, url, status, responseTime);
            }
        }
    }
}));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api', routes_1.default);
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'वितरक आवेदन API सर्भर चलिरहेको छ',
        data: {
            name: 'Distributor Application API',
            version: '1.0.0',
            status: 'running',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            endpoints: {
                api: '/api',
                health: '/api/health',
                auth: '/api/auth',
                applications: '/api/applications',
                distributors: '/api/distributors'
            }
        }
    });
});
app.get('/health', async (req, res) => {
    const dbHealthy = await (0, database_1.checkDatabaseHealth)();
    const status = dbHealthy ? 'healthy' : 'unhealthy';
    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json({
        success: dbHealthy,
        message: `API ${status === 'healthy' ? 'स्वस्थ छ' : 'समस्यामा छ'}`,
        data: {
            status,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbHealthy ? 'connected' : 'disconnected',
            environment: process.env.NODE_ENV || 'development',
            memory: process.memoryUsage(),
            version: '1.0.0'
        }
    });
});
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
const startServer = async () => {
    try {
        try {
            await (0, database_1.connectDatabase)();
        }
        catch (error) {
            if (process.env.NODE_ENV === 'development') {
                logger_1.default.warn('Database connection failed - running without database in development mode');
            }
            else {
                throw error;
            }
        }
        const server = app.listen(PORT, () => {
            logger_1.default.info(`🚀 सर्भर पोर्ट ${PORT} मा सुरु भयो`);
            logger_1.default.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger_1.default.info(`📊 API Documentation: http://localhost:${PORT}/api`);
            logger_1.default.info(`🏥 Health Check: http://localhost:${PORT}/health`);
            if (process.env.NODE_ENV === 'development') {
                logger_1.default.info(`🔧 Development mode - detailed logging enabled`);
            }
        });
        const gracefulShutdown = (signal) => {
            logger_1.default.info(`${signal} received. Starting graceful shutdown...`);
            server.close(async () => {
                logger_1.default.info('HTTP server closed');
                try {
                    const { disconnectDatabase } = await Promise.resolve().then(() => __importStar(require('./utils/database')));
                    await disconnectDatabase();
                    logger_1.default.info('✅ Graceful shutdown completed');
                    process.exit(0);
                }
                catch (error) {
                    logger_1.default.error('Error during graceful shutdown', error);
                    process.exit(1);
                }
            });
            setTimeout(() => {
                logger_1.default.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 30000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            logger_1.default.error('Uncaught Exception', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.default.error('Unhandled Rejection at Promise', reason, { promise });
            process.exit(1);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map