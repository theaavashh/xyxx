"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmailWithoutCredentials = exports.testEmail = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const mailjet_service_1 = __importDefault(require("../services/mailjet.service"));
exports.testEmail = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { email = 'test@example.com', template = 'distributor_approved' } = req.body;
    try {
        const testData = {
            applicationId: 'TEST-APP-001',
            fullName: 'Test Distributor',
            email: email,
            companyName: 'Test Company Pvt. Ltd.',
            distributionArea: 'Kathmandu Valley',
            businessType: 'SOLE_PROPRIETORSHIP',
            reviewNotes: 'This is a test email to verify Mailjet integration',
            approvedDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
        const testCredentials = {
            username: 'test_distributor',
            email: email,
            password: 'TestPassword123!',
            categories: [
                { id: '1', title: 'ZipZip Achar', description: 'Mutton Achar, Pork Achar' },
                { id: '2', title: 'सुकुटी', description: 'Various dry meat products' }
            ]
        };
        await mailjet_service_1.default.notifyDistributorApproved(testData, testCredentials);
        const response = {
            success: true,
            message: 'Test email sent successfully',
            data: {
                email: email,
                template: template,
                timestamp: new Date().toISOString()
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Test email failed:', error);
        const response = {
            success: false,
            message: 'Failed to send test email',
            error: 'EMAIL_SEND_FAILED',
            data: {
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        };
        res.status(500).json(response);
    }
});
exports.testEmailWithoutCredentials = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { email = 'test@example.com' } = req.body;
    try {
        const testData = {
            applicationId: 'TEST-APP-002',
            fullName: 'Test Distributor Without Credentials',
            email: email,
            companyName: 'Test Company Without Creds Pvt. Ltd.',
            distributionArea: 'Pokhara Valley',
            businessType: 'PARTNERSHIP',
            reviewNotes: 'This is a test email without credentials to verify Mailjet integration',
            approvedDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
        await mailjet_service_1.default.notifyDistributorApproved(testData);
        const response = {
            success: true,
            message: 'Test email (without credentials) sent successfully',
            data: {
                email: email,
                template: 'distributor_approved',
                timestamp: new Date().toISOString()
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Test email failed:', error);
        const response = {
            success: false,
            message: 'Failed to send test email',
            error: 'EMAIL_SEND_FAILED',
            data: {
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        };
        res.status(500).json(response);
    }
});
//# sourceMappingURL=test.controller.js.map