"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../utils/logger"));
class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }
    initializeTransporter() {
        if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
            this.transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT),
                secure: parseInt(process.env.SMTP_PORT) === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            logger_1.default.info('Email service initialized with SMTP configuration');
        }
        else {
            logger_1.default.warn('Email service not initialized - SMTP configuration missing');
        }
    }
    async sendEmail(notification) {
        if (!this.transporter) {
            logger_1.default.warn('Email not sent - transporter not initialized', { to: notification.to, subject: notification.subject });
            return false;
        }
        try {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: notification.to,
                subject: notification.subject,
                html: this.generateEmailTemplate(notification.template, notification.data)
            };
            const result = await this.transporter.sendMail(mailOptions);
            logger_1.default.info('Email sent successfully', {
                to: notification.to,
                subject: notification.subject,
                messageId: result.messageId
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to send email', error, {
                to: notification.to,
                subject: notification.subject
            });
            return false;
        }
    }
    generateEmailTemplate(template, data) {
        switch (template) {
            case 'application_submitted':
                return this.applicationSubmittedTemplate(data);
            case 'application_status_updated':
                return this.applicationStatusUpdatedTemplate(data);
            case 'application_approved':
                return this.applicationApprovedTemplate(data);
            case 'application_rejected':
                return this.applicationRejectedTemplate(data);
            default:
                return this.defaultTemplate(data);
        }
    }
    applicationSubmittedTemplate(data) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>आवेदन पेश गरिएको</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>आवेदन सफलतापूर्वक पेश गरिएको</h1>
          </div>
          <div class="content">
            <p>प्रिय ${data.fullName},</p>
            <p>तपाईंको वितरक आवेदन सफलतापूर्वक पेश गरिएको छ।</p>
            <p><strong>आवेदन विवरण:</strong></p>
            <ul>
              <li>आवेदन ID: ${data.applicationId}</li>
              <li>कम्पनी: ${data.companyName}</li>
              <li>पेश गरिएको मिति: ${data.submittedDate}</li>
              <li>स्थिति: पेन्डिङ</li>
            </ul>
            <p>हाम्रो टोलीले तपाईंको आवेदनको समीक्षा गर्नेछ र छिट्टै सम्पर्क गर्नेछ।</p>
          </div>
          <div class="footer">
            <p>धन्यवाद,<br>वितरक व्यवस्थापन टोली</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    applicationStatusUpdatedTemplate(data) {
        const statusText = this.getStatusText(data.status);
        const statusColor = this.getStatusColor(data.status);
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>आवेदन स्थिति अपडेट</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .status { padding: 10px; background-color: ${statusColor}; color: white; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>आवेदन स्थिति अपडेट</h1>
          </div>
          <div class="content">
            <p>प्रिय ${data.fullName},</p>
            <p>तपाईंको वितरक आवेदनको स्थिति अपडेट गरिएको छ।</p>
            <p><strong>आवेदन विवरण:</strong></p>
            <ul>
              <li>आवेदन ID: ${data.applicationId}</li>
              <li>कम्पनी: ${data.companyName}</li>
              <li>नयाँ स्थिति: <span class="status">${statusText}</span></li>
              <li>अपडेट मिति: ${data.updatedDate}</li>
            </ul>
            ${data.reviewNotes ? `<p><strong>समीक्षा टिप्पणी:</strong><br>${data.reviewNotes}</p>` : ''}
            <p>थप जानकारीको लागि हामीलाई सम्पर्क गर्नुहोस्।</p>
          </div>
          <div class="footer">
            <p>धन्यवाद,<br>वितरक व्यवस्थापन टोली</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    applicationApprovedTemplate(data) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>आवेदन स्वीकृत</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 बधाई छ! आवेदन स्वीकृत भयो</h1>
          </div>
          <div class="content">
            <div class="success">
              <p><strong>तपाईंको वितरक आवेदन स्वीकृत भएको छ!</strong></p>
            </div>
            <p>प्रिय ${data.fullName},</p>
            <p>हामी तपाईंलाई सूचित गर्न पाउँदा खुसी छौं कि तपाईंको वितरक आवेदन स्वीकृत भएको छ।</p>
            <p><strong>आवेदन विवरण:</strong></p>
            <ul>
              <li>आवेदन ID: ${data.applicationId}</li>
              <li>कम्पनी: ${data.companyName}</li>
              <li>स्वीकृत मिति: ${data.approvedDate}</li>
              <li>वितरण क्षेत्र: ${data.distributionArea}</li>
            </ul>
            <p>अब तपाईं हाम्रो आधिकारिक वितरक हुनुहुन्छ। अगाडिको प्रक्रियाको लागि हाम्रो टोलीले छिट्टै सम्पर्क गर्नेछ।</p>
            ${data.reviewNotes ? `<p><strong>थप जानकारी:</strong><br>${data.reviewNotes}</p>` : ''}
          </div>
          <div class="footer">
            <p>धन्यवाद र स्वागत छ,<br>वितरक व्यवस्थापन टोली</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    applicationRejectedTemplate(data) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>आवेदन अस्वीकृत</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>आवेदन अस्वीकृत</h1>
          </div>
          <div class="content">
            <p>प्रिय ${data.fullName},</p>
            <div class="warning">
              <p>दुःखको साथ सूचित गर्दछौं कि तपाईंको वितरक आवेदन अस्वीकृत भएको छ।</p>
            </div>
            <p><strong>आवेदन विवरण:</strong></p>
            <ul>
              <li>आवेदन ID: ${data.applicationId}</li>
              <li>कम्पनी: ${data.companyName}</li>
              <li>अस्वीकृत मिति: ${data.rejectedDate}</li>
            </ul>
            ${data.reviewNotes ? `<p><strong>अस्वीकृतिको कारण:</strong><br>${data.reviewNotes}</p>` : ''}
            <p>तपाईं आवश्यक सुधार गरेर पुनः आवेदन दिन सक्नुहुन्छ। थप जानकारीको लागि हामीलाई सम्पर्क गर्नुहोस्।</p>
          </div>
          <div class="footer">
            <p>धन्यवाद,<br>वितरक व्यवस्थापन टोली</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    defaultTemplate(data) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>सूचना</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>सूचना</h1>
          </div>
          <div class="content">
            <p>${data.message || 'तपाईंको लागि एक सूचना छ।'}</p>
          </div>
          <div class="footer">
            <p>धन्यवाद,<br>वितरक व्यवस्थापन टोली</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    getStatusText(status) {
        const statusMap = {
            'PENDING': 'पेन्डिङ',
            'UNDER_REVIEW': 'समीक्षाधीन',
            'APPROVED': 'स्वीकृत',
            'REJECTED': 'अस्वीकृत',
            'REQUIRES_CHANGES': 'परिवर्तन आवश्यक'
        };
        return statusMap[status] || status;
    }
    getStatusColor(status) {
        const colorMap = {
            'PENDING': '#FF9800',
            'UNDER_REVIEW': '#2196F3',
            'APPROVED': '#4CAF50',
            'REJECTED': '#f44336',
            'REQUIRES_CHANGES': '#FF5722'
        };
        return colorMap[status] || '#2196F3';
    }
    async notifyApplicationSubmitted(applicationData) {
        const notification = {
            to: applicationData.email,
            subject: 'आवेदन सफलतापूर्वक पेश गरिएको - वितरक आवेदन',
            template: 'application_submitted',
            data: applicationData
        };
        await this.sendEmail(notification);
    }
    async notifyApplicationStatusUpdate(applicationData) {
        const notification = {
            to: applicationData.email,
            subject: `आवेदन स्थिति अपडेट - ${this.getStatusText(applicationData.status)}`,
            template: 'application_status_updated',
            data: applicationData
        };
        await this.sendEmail(notification);
    }
}
const emailService = new EmailService();
exports.default = emailService;
//# sourceMappingURL=email.service.js.map