import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/error.middleware';
import mailjetEmailService from '../services/mailjet.service';

// Test email endpoint
export const testEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

    await mailjetEmailService.notifyDistributorApproved(testData, testCredentials);

    const response: ApiResponse = {
      success: true,
      message: 'Test email sent successfully',
      data: {
        email: email,
        template: template,
        timestamp: new Date().toISOString()
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Test email failed:', error);
    
    const response: ApiResponse = {
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

// Test email without credentials
export const testEmailWithoutCredentials = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

    await mailjetEmailService.notifyDistributorApproved(testData);

    const response: ApiResponse = {
      success: true,
      message: 'Test email (without credentials) sent successfully',
      data: {
        email: email,
        template: 'distributor_approved',
        timestamp: new Date().toISOString()
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Test email failed:', error);
    
    const response: ApiResponse = {
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











