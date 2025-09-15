"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const errorHandler = (error, req, res, next) => {
    console.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        timestamp: new Date().toISOString()
    });
    let statusCode = 500;
    let message = 'आन्तरिक सर्भर त्रुटि';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                statusCode = 409;
                message = 'डुप्लिकेट डाटा - यो जानकारी पहिले नै अवस्थित छ';
                errorCode = 'DUPLICATE_ENTRY';
                break;
            case 'P2025':
                statusCode = 404;
                message = 'अनुरोध गरिएको डाटा फेला परेन';
                errorCode = 'RECORD_NOT_FOUND';
                break;
            case 'P2003':
                statusCode = 400;
                message = 'सम्बन्धित डाटा फेला परेन';
                errorCode = 'FOREIGN_KEY_CONSTRAINT';
                break;
            case 'P2014':
                statusCode = 400;
                message = 'डाटा सम्बन्धमा समस्या';
                errorCode = 'RELATION_VIOLATION';
                break;
            default:
                statusCode = 500;
                message = 'डाटाबेस त्रुटि';
                errorCode = 'DATABASE_ERROR';
        }
    }
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'डाटा प्रमाणीकरण त्रुटि';
        errorCode = 'VALIDATION_ERROR';
    }
    else if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        statusCode = 503;
        message = 'डाटाबेस जडान समस्या';
        errorCode = 'DATABASE_CONNECTION_ERROR';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'अवैध प्रमाणीकरण टोकन';
        errorCode = 'INVALID_TOKEN';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'प्रमाणीकरण टोकनको समय सकिएको छ';
        errorCode = 'TOKEN_EXPIRED';
    }
    else if (error.code === 'LIMIT_FILE_SIZE') {
        statusCode = 413;
        message = 'फाइल साइज धेरै ठूलो छ';
        errorCode = 'FILE_TOO_LARGE';
    }
    else if (error.code === 'LIMIT_FILE_COUNT') {
        statusCode = 413;
        message = 'धेरै फाइलहरू अपलोड गर्न खोजिएको';
        errorCode = 'TOO_MANY_FILES';
    }
    else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        statusCode = 400;
        message = 'अनपेक्षित फाइल प्रकार';
        errorCode = 'UNEXPECTED_FILE';
    }
    else if (error.statusCode) {
        statusCode = error.statusCode;
        message = error.message || message;
        errorCode = error.code || errorCode;
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'डाटा प्रमाणीकरण त्रुटि';
        errorCode = 'VALIDATION_ERROR';
    }
    const response = {
        success: false,
        message,
        error: errorCode
    };
    if (process.env.NODE_ENV === 'development') {
        response.error = {
            code: errorCode,
            message: error.message,
            stack: error.stack
        };
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    const response = {
        success: false,
        message: 'अनुरोध गरिएको पृष्ठ फेला परेन',
        error: 'NOT_FOUND'
    };
    res.status(404).json(response);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.middleware.js.map