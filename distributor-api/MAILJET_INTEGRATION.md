# Mailjet Email Integration for Distributor Approval Notifications

This document describes the implementation of email notifications using Mailjet when admin approves distributor applications.

## Overview

The system now automatically sends email notifications to distributors when their applications are approved. The emails are sent using Mailjet's API and include:

1. **Approval notification** - Basic approval message
2. **Approval with credentials** - Approval message including login credentials
3. **Professional HTML templates** - Beautiful, responsive email templates

## Features

### ✅ Implemented Features

1. **Automatic Email Sending**
   - Emails sent when applications are approved via admin panel
   - Emails sent when credentials are set for approved distributors
   - Both authenticated and development endpoints supported

2. **Two Email Templates**
   - `distributor_approved` - Basic approval notification
   - `distributor_approved_with_credentials` - Approval with login credentials

3. **Professional Design**
   - Responsive HTML templates
   - Branded styling with gradients and modern design
   - Mobile-friendly layout
   - Clear call-to-action sections

4. **Error Handling**
   - Graceful fallback if email service fails
   - Detailed logging for debugging
   - Non-blocking email sending (approval process continues even if email fails)

5. **Test Endpoints**
   - Development-only test endpoints for email verification
   - Support for testing both email templates

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Mailjet Configuration
MAILJET_API_KEY="your_mailjet_api_key_here"
MAILJET_SECRET_KEY="your_mailjet_secret_key_here"
MAILJET_FROM_EMAIL="noreply@yourdomain.com"
MAILJET_FROM_NAME="Your Company Name"

# Alternative SMTP Configuration (if not using Mailjet)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

### Getting Mailjet Credentials

1. Sign up for a Mailjet account at [mailjet.com](https://mailjet.com)
2. Go to Account Settings → API Key Management
3. Create a new API key pair
4. Copy the API Key and Secret Key to your environment variables

## Usage

### Automatic Email Sending

Emails are automatically sent in these scenarios:

1. **Application Approval** (`/api/applications/:id/status`)
   - When admin approves an application
   - Includes basic approval information
   - May include credentials if user account is created immediately

2. **Credentials Setting** (`/api/distributors/:id/credentials`)
   - When admin sets credentials for an approved distributor
   - Includes full login credentials and assigned categories

### Test Endpoints (Development Only)

Test the email functionality using these endpoints:

```bash
# Test email with credentials
curl -X POST http://localhost:5000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "template": "distributor_approved_with_credentials"
  }'

# Test email without credentials
curl -X POST http://localhost:5000/api/test/email-without-credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

## Email Templates

### Template 1: Basic Approval

- **Subject**: 🎉 Distributor Application Approved - Welcome!
- **Content**: 
  - Congratulations message
  - Application details
  - Next steps information
  - Contact information

### Template 2: Approval with Credentials

- **Subject**: 🎉 Distributor Application Approved - Login Credentials Included
- **Content**:
  - All content from basic approval
  - Login credentials section
  - Security warning
  - Assigned product categories
  - Step-by-step onboarding instructions

## Code Structure

### Files Created/Modified

1. **`src/services/mailjet.service.ts`** - Main Mailjet service
2. **`src/controllers/distributor.controller.ts`** - Added email sending to approval process
3. **`src/controllers/distributors.controller.ts`** - Added email sending to credentials setting
4. **`src/controllers/test.controller.ts`** - Test endpoints for email functionality
5. **`src/routes/index.ts`** - Added test routes
6. **`env.example`** - Added Mailjet configuration variables

### Service Architecture

```typescript
class MailjetEmailService {
  // Initialize Mailjet connection
  private initializeMailjet()
  
  // Send email with template
  async sendEmail(notification: EmailNotification)
  
  // Generate HTML templates
  private generateEmailTemplate(template: string, data: any)
  
  // Specific notification methods
  async notifyDistributorApproved(data: any, credentials?: any)
}
```

## Email Content Examples

### Approval Email (Without Credentials)

```html
🎉 Congratulations! Your Distributor Application Has Been Approved

Dear John Doe,

We are delighted to inform you that your distributor application has been successfully approved by our management team. Welcome to our official distributor network!

📋 Application Details:
• Application ID: APP-123456
• Company: ABC Distributors Pvt. Ltd.
• Approved Date: December 20, 2024
• Distribution Area: Kathmandu Valley
• Business Type: Sole Proprietorship

Next Steps:
Our team will contact you shortly to set up your distributor account credentials and provide product catalogs.
```

### Approval Email (With Credentials)

```html
🎉 Congratulations! Your Distributor Application Has Been Approved

Dear John Doe,

Your distributor account has been created and is ready for use.

🔐 Your Login Credentials:
Username: dist_abc123
Password: TempPass123!
Email: john@example.com

⚠️ Important Security Notice:
Please change your password immediately after your first login for security purposes.

📦 Assigned Product Categories:
• ZipZip Achar
• सुकुटी

🚀 Next Steps:
1. Login to your distributor portal using the credentials above
2. Change your password for security
3. Complete your profile setup
4. Review available products and pricing
5. Contact our support team for any assistance
```

## Error Handling

The system includes comprehensive error handling:

1. **Service Initialization**: Logs warning if Mailjet credentials are missing
2. **Email Sending**: Catches and logs errors without failing the main process
3. **Template Generation**: Falls back to default template if specific template fails
4. **Network Issues**: Graceful handling of API failures

## Monitoring and Logging

All email activities are logged with the following information:

- Email recipient
- Email subject
- Template used
- Success/failure status
- Error details (if any)
- Timestamp

Example log entries:
```
[INFO] Mailjet service initialized successfully
[INFO] Email sent successfully via Mailjet { to: "john@example.com", subject: "🎉 Distributor Application Approved", messageId: "123456" }
[ERROR] Failed to send email via Mailjet { to: "invalid@email", error: "Invalid email address" }
```

## Security Considerations

1. **Credentials Protection**: Passwords are only sent via email, not logged
2. **Environment Variables**: All sensitive data stored in environment variables
3. **Template Validation**: Email templates are sanitized to prevent injection
4. **Rate Limiting**: Consider implementing rate limiting for email endpoints

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check Mailjet API credentials
   - Verify email addresses are valid
   - Check network connectivity
   - Review application logs

2. **Template rendering issues**
   - Verify data structure matches template expectations
   - Check for missing required fields
   - Review HTML template syntax

3. **Authentication errors**
   - Verify Mailjet API key and secret
   - Check account status and billing
   - Ensure API key has send permissions

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide detailed logs for email operations.

## Future Enhancements

Potential improvements for future versions:

1. **Email Templates Management**: Admin interface for managing email templates
2. **Multi-language Support**: Templates in different languages
3. **Email Scheduling**: Delayed sending for better deliverability
4. **Analytics Integration**: Track email open rates and engagement
5. **Template Customization**: Company branding and customization options

## Support

For issues related to email functionality:

1. Check the application logs for error messages
2. Verify Mailjet account status and billing
3. Test using the development endpoints
4. Review environment variable configuration

---

**Note**: This integration is designed to be robust and production-ready. The email service will gracefully handle failures without affecting the core distributor approval workflow.
