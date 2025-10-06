import Mailjet from 'node-mailjet';
import { EmailNotification } from '../types';
import logger from '../utils/logger';

// Mailjet email service class
class MailjetEmailService {
  private mailjet: any = null;

  constructor() {
    this.initializeMailjet();
  }

  private initializeMailjet(): void {
    // Only initialize if Mailjet credentials are provided
    if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
      this.mailjet = Mailjet.apiConnect(
        process.env.MAILJET_API_KEY,
        process.env.MAILJET_SECRET_KEY
      );
      logger.info('Mailjet service initialized successfully');
    } else {
      logger.warn('Mailjet service not initialized - API credentials missing');
    }
  }

  // Send email notification using Mailjet
  async sendEmail(notification: EmailNotification): Promise<boolean> {
    if (!this.mailjet) {
      logger.warn('Email not sent - Mailjet not initialized', { 
        to: notification.to, 
        subject: notification.subject 
      });
      return false;
    }

    try {
      const request = this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_FROM_EMAIL || 'noreply@distributor.com',
              Name: process.env.MAILJET_FROM_NAME || 'Distributor Management System'
            },
            To: [
              {
                Email: notification.to,
                Name: notification.data?.fullName || 'Distributor'
              }
            ],
            Subject: notification.subject,
            HTMLPart: this.generateEmailTemplate(notification.template, notification.data),
            TextPart: this.generateTextTemplate(notification.template, notification.data)
          }
        ]
      });

      const result = await request;
      logger.info('Email sent successfully via Mailjet', { 
        to: notification.to, 
        subject: notification.subject, 
        messageId: result.body.Messages[0].To[0].MessageID 
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to send email via Mailjet', error, { 
        to: notification.to, 
        subject: notification.subject 
      });
      return false;
    }
  }

  // Generate email template for approval notification
  private generateEmailTemplate(template: string, data: Record<string, any>): string {
    switch (template) {
      case 'distributor_approved':
        return this.distributorApprovedTemplate(data);
      case 'distributor_approved_with_credentials':
        return this.distributorApprovedWithCredentialsTemplate(data);
      case 'distributor_offer_letter':
        return this.distributorOfferLetterTemplate(data);
      default:
        return this.defaultTemplate(data);
    }
  }

  // Generate text template (fallback)
  private generateTextTemplate(template: string, data: Record<string, any>): string {
    switch (template) {
      case 'distributor_approved':
        return `Congratulations ${data.fullName}! Your distributor application has been approved. Application ID: ${data.applicationId}`;
      case 'distributor_approved_with_credentials':
        return `Congratulations ${data.fullName}! Your distributor application has been approved. Your login credentials: Username: ${data.username}, Password: ${data.password}`;
      default:
        return data.message || 'Notification from Distributor Management System';
    }
  }

  // Distributor approved template
  private distributorApprovedTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Distributor Application Approved</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
            color: white; 
            padding: 40px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600;
          }
          .content { 
            padding: 40px 20px; 
            background-color: #ffffff;
          }
          .success-badge { 
            background-color: #d4edda; 
            border: 2px solid #c3e6cb; 
            color: #155724; 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center; 
            margin-bottom: 30px;
          }
          .success-badge h2 { 
            margin: 0 0 10px 0; 
            color: #155724; 
            font-size: 24px;
          }
          .info-section { 
            background-color: #f8f9fa; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 25px 0;
            border-left: 4px solid #4CAF50;
          }
          .info-section h3 { 
            margin: 0 0 15px 0; 
            color: #2c3e50; 
            font-size: 18px;
          }
          .info-list { 
            list-style: none; 
            padding: 0; 
            margin: 0;
          }
          .info-list li { 
            padding: 8px 0; 
            border-bottom: 1px solid #e9ecef;
          }
          .info-list li:last-child { 
            border-bottom: none;
          }
          .info-list strong { 
            color: #495057; 
            display: inline-block; 
            width: 140px;
          }
          .footer { 
            padding: 30px 20px; 
            text-align: center; 
            color: #6c757d; 
            background-color: #f8f9fa; 
            border-top: 1px solid #dee2e6;
          }
          .contact-info { 
            background-color: #e3f2fd; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0;
            border-left: 4px solid #2196F3;
          }
          .contact-info h4 { 
            margin: 0 0 10px 0; 
            color: #1976d2;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your Distributor Application Has Been Approved</p>
          </div>
          
          <div class="content">
            <div class="success-badge">
              <h2>✅ Application Approved</h2>
              <p style="margin: 0; font-size: 16px;">Welcome to our distributor network!</p>
            </div>
            
            <p>Dear <strong>${data.fullName}</strong>,</p>
            
            <p>We are delighted to inform you that your distributor application has been successfully approved by our management team. Welcome to our official distributor network!</p>
            
            <div class="info-section">
              <h3>📋 Application Details</h3>
              <ul class="info-list">
                <li><strong>Application ID:</strong> ${data.applicationId}</li>
                <li><strong>Company:</strong> ${data.companyName}</li>
                <li><strong>Approved Date:</strong> ${data.approvedDate}</li>
                <li><strong>Distribution Area:</strong> ${data.distributionArea}</li>
                <li><strong>Business Type:</strong> ${data.businessType}</li>
              </ul>
            </div>
            
            <p>As an approved distributor, you now have access to our comprehensive product range and can begin your business operations in your designated area.</p>
            
            ${data.reviewNotes ? `
            <div class="info-section">
              <h3>📝 Additional Information</h3>
              <p>${data.reviewNotes}</p>
            </div>
            ` : ''}
            
            <div class="contact-info">
              <h4>📞 Next Steps</h4>
              <p>Our team will contact you shortly to:</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Set up your distributor account credentials</li>
                <li>Provide product catalogs and pricing information</li>
                <li>Schedule initial training and onboarding sessions</li>
                <li>Discuss logistics and delivery arrangements</li>
              </ul>
            </div>
            
            <p>We look forward to a successful and long-term partnership with you.</p>
          </div>
          
          <div class="footer">
            <p><strong>Thank you and welcome aboard!</strong></p>
            <p>Distributor Management Team<br>
            Email: support@distributor.com<br>
            Phone: +977-1-XXXXXXX</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Distributor approved with credentials template
  private distributorApprovedWithCredentialsTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Distributor Application Approved - Login Credentials</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
            color: white; 
            padding: 40px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600;
          }
          .content { 
            padding: 40px 20px; 
            background-color: #ffffff;
          }
          .success-badge { 
            background-color: #d4edda; 
            border: 2px solid #c3e6cb; 
            color: #155724; 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center; 
            margin-bottom: 30px;
          }
          .success-badge h2 { 
            margin: 0 0 10px 0; 
            color: #155724; 
            font-size: 24px;
          }
          .credentials-section { 
            background-color: #fff3cd; 
            border: 2px solid #ffeaa7; 
            color: #856404; 
            padding: 25px; 
            border-radius: 10px; 
            margin: 25px 0;
          }
          .credentials-section h3 { 
            margin: 0 0 20px 0; 
            color: #856404; 
            font-size: 20px;
          }
          .credential-item { 
            background-color: #ffffff; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 8px; 
            border-left: 4px solid #ffc107;
          }
          .credential-item strong { 
            color: #495057; 
            display: block; 
            margin-bottom: 5px;
          }
          .credential-value { 
            font-family: 'Courier New', monospace; 
            background-color: #f8f9fa; 
            padding: 8px 12px; 
            border-radius: 4px; 
            font-size: 16px; 
            font-weight: bold; 
            color: #2c3e50;
          }
          .info-section { 
            background-color: #f8f9fa; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 25px 0;
            border-left: 4px solid #4CAF50;
          }
          .info-section h3 { 
            margin: 0 0 15px 0; 
            color: #2c3e50; 
            font-size: 18px;
          }
          .info-list { 
            list-style: none; 
            padding: 0; 
            margin: 0;
          }
          .info-list li { 
            padding: 8px 0; 
            border-bottom: 1px solid #e9ecef;
          }
          .info-list li:last-child { 
            border-bottom: none;
          }
          .info-list strong { 
            color: #495057; 
            display: inline-block; 
            width: 140px;
          }
          .footer { 
            padding: 30px 20px; 
            text-align: center; 
            color: #6c757d; 
            background-color: #f8f9fa; 
            border-top: 1px solid #dee2e6;
          }
          .warning-section { 
            background-color: #f8d7da; 
            border: 1px solid #f5c6cb; 
            color: #721c24; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0;
          }
          .warning-section h4 { 
            margin: 0 0 10px 0; 
            color: #721c24;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your Distributor Application Has Been Approved</p>
          </div>
          
          <div class="content">
            <div class="success-badge">
              <h2>✅ Application Approved</h2>
              <p style="margin: 0; font-size: 16px;">Your account is ready for use!</p>
            </div>
            
            <p>Dear <strong>${data.fullName}</strong>,</p>
            
            <p>We are delighted to inform you that your distributor application has been successfully approved. Your distributor account has been created and is ready for use.</p>
            
            <div class="credentials-section">
              <h3>🔐 Your Login Credentials</h3>
              <p style="margin: 0 0 20px 0;">Please save these credentials securely:</p>
              
              <div class="credential-item">
                <strong>Username:</strong>
                <div class="credential-value">${data.username}</div>
              </div>
              
              <div class="credential-item">
                <strong>Password:</strong>
                <div class="credential-value">${data.password}</div>
              </div>
              
              <div class="credential-item">
                <strong>Email:</strong>
                <div class="credential-value">${data.email}</div>
              </div>
            </div>
            
            <div class="warning-section">
              <h4>⚠️ Important Security Notice</h4>
              <p>Please change your password immediately after your first login for security purposes. Do not share these credentials with anyone.</p>
            </div>
            
            <div class="info-section">
              <h3>📋 Application Details</h3>
              <ul class="info-list">
                <li><strong>Application ID:</strong> ${data.applicationId}</li>
                <li><strong>Company:</strong> ${data.companyName}</li>
                <li><strong>Approved Date:</strong> ${data.approvedDate}</li>
                <li><strong>Distribution Area:</strong> ${data.distributionArea}</li>
                <li><strong>Business Type:</strong> ${data.businessType}</li>
              </ul>
            </div>
            
            ${data.categories && data.categories.length > 0 ? `
            <div class="info-section">
              <h3>📦 Assigned Product Categories</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                ${data.categories.map((category: any) => `<li>${category.title}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            ${data.reviewNotes ? `
            <div class="info-section">
              <h3>📝 Additional Information</h3>
              <p>${data.reviewNotes}</p>
            </div>
            ` : ''}
            
            <div class="info-section">
              <h3>🚀 Next Steps</h3>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Login to your distributor portal using the credentials above</li>
                <li>Change your password for security</li>
                <li>Complete your profile setup</li>
                <li>Review available products and pricing</li>
                <li>Contact our support team for any assistance</li>
              </ol>
            </div>
            
            <p>We look forward to a successful and long-term partnership with you.</p>
          </div>
          
          <div class="footer">
            <p><strong>Thank you and welcome aboard!</strong></p>
            <p>Distributor Management Team<br>
            Email: support@distributor.com<br>
            Phone: +977-1-XXXXXXX</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Distributor Offer Letter Template (Nepali)
  private distributorOfferLetterTemplate(data: any): string {
    const currentDate = new Date().toLocaleDateString('ne-NP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const productTableRows = data.products && data.products.length > 0 
      ? data.products.map((product: any, index: number) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${product.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${product.units || '500gm'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${product.packaging || 'Plastic Bottle'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. ${product.distributorPrice || '500'}/-</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. ${product.wholesalePrice || '525'}/-</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. ${product.rate || '575'}/-</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. ${product.mrp || '700'}/-</td>
          </tr>
        `).join('')
      : `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">1</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Buff Achar</td>
            <td style="border: 1px solid #ddd; padding: 8px;">500gm</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Plastic Bottle</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. 500/-</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. 525/-</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. 575/-</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. 700/-</td>
          </tr>
        `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>वितरक नियुक्ति प्रस्ताव पत्र</title>
        <style>
          body { 
            font-family: 'Mangal', 'Arial Unicode MS', Arial, sans-serif; 
            line-height: 1.8; 
            color: #333; 
            margin: 0; 
            padding: 20px; 
            background-color: #f9f9f9;
          }
          .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: bold;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content { 
            padding: 30px; 
            background-color: #ffffff;
          }
          .subject {
            background-color: #e8f4fd;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .subject h2 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 18px;
          }
          .distributor-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #dee2e6;
          }
          .distributor-info h3 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 16px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
          }
          .info-row {
            display: flex;
            margin: 8px 0;
            align-items: center;
          }
          .info-label {
            font-weight: bold;
            color: #495057;
            min-width: 120px;
            margin-right: 10px;
          }
          .info-value {
            color: #2c3e50;
            flex: 1;
          }
          .section {
            margin: 25px 0;
          }
          .section h3 {
            color: #2c3e50;
            font-size: 18px;
            margin: 0 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #3498db;
          }
          .section h4 {
            color: #34495e;
            font-size: 16px;
            margin: 15px 0 10px 0;
          }
          .section p {
            margin: 10px 0;
            text-align: justify;
          }
          .section ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .section li {
            margin: 8px 0;
          }
          .product-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .product-table th {
            background-color: #3498db;
            color: white;
            padding: 12px 8px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #2980b9;
          }
          .product-table td {
            border: 1px solid #ddd;
            padding: 10px 8px;
            text-align: left;
          }
          .product-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .product-table tr:hover {
            background-color: #e8f4fd;
          }
          .responsibilities {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .responsibilities h4 {
            color: #856404;
            margin: 0 0 15px 0;
          }
          .footer { 
            padding: 30px; 
            text-align: center; 
            color: #6c757d; 
            background-color: #f8f9fa; 
            border-top: 1px solid #dee2e6;
          }
          .footer p {
            margin: 5px 0;
          }
          .signature-section {
            margin: 30px 0;
            text-align: right;
          }
          .signature-line {
            border-bottom: 1px solid #333;
            width: 300px;
            margin: 20px 0 5px auto;
          }
          .highlight {
            background-color: #fff3cd;
            padding: 2px 4px;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Celebrate Multi Industries Pvt. Ltd.</h1>
            <p>वितरक नियुक्ति प्रस्ताव पत्र</p>
          </div>
          
          <div class="content">
            <div class="subject">
              <h2>विषयः वितरक नियुक्ति प्रस्ताव पत्र (Distributor Offer Letter)</h2>
            </div>

            <div class="distributor-info">
              <h3>वितरक विवरण</h3>
              <div class="info-row">
                <span class="info-label">वितरकको नाम:</span>
                <span class="info-value">${data.fullName || '_____________'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">ठेगाना:</span>
                <span class="info-value">${data.address || '_____________'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">सम्पर्क नम्बर:</span>
                <span class="info-value">${data.contactNumber || '_____________'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">इमेल:</span>
                <span class="info-value">${data.email || '_____________'}</span>
              </div>
            </div>

            <div class="section">
              <p><strong>महोदय,</strong></p>
              <p>Celebrate Multi Industries Pvt. Ltd. ले तपाईंलाई हाम्रो आधिकारिक वितरकको रूपमा नियुक्त गर्न प्रस्ताव गर्दछ। तपाईंले प्रदान गरेको विवरण, अनुभव र व्यावसायिक क्षमतालाई विचार गरी यो निर्णय गरिएको छ।</p>
            </div>

            <div class="section">
              <h3>१. वितरक क्षेत्रः</h3>
              <p><span class="highlight">${data.distributionArea || 'जिल्ला/नगरपालिका/वार्ड'}</span> - यस क्षेत्रमा तपाईंले वितरण गर्नुपर्ने छ।</p>
            </div>

            <div class="section">
              <h3>२. उत्पादहरूः</h3>
              <p>Celebrate Multi Industries का सम्पूर्ण FMCG र अन्य सूचीबद्ध वस्तुहरू (सङ्लग्न सूचि अनुसार)</p>
              
              <h4>Products list यस प्रकार छन्:</h4>
              <table class="product-table">
                <thead>
                  <tr>
                    <th>S.N.</th>
                    <th>Product Name</th>
                    <th>Units</th>
                    <th>Packaging</th>
                    <th>Distributor Price (NPR)</th>
                    <th>Wholesale Price (NPR)</th>
                    <th>Rate</th>
                    <th>MRP (NPR)</th>
                  </tr>
                </thead>
                <tbody>
                  ${productTableRows}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h3>३. मूल्य संरचना (Price Policy):</h3>
              <p>कम्पनीले प्रदान गरेको मूल्य सूची अनुसार मात्र बिक्री गर्नुपर्नेछ।</p>
            </div>

            <div class="section">
              <h3>४. भुक्तानीका terms and condition:</h3>
              <p>अग्रिम नगद ३% छुट, २१ दिनको क्रेडिटमा बैंक ग्यारेन्टी हुनुपर्ने छ।</p>
            </div>

            <div class="section">
              <h3>५. अन्य सुबिधा:</h3>
              <p>Re-Distribution, Expenses Scheme, Promotional activities, Sampling Ect</p>
              <p>कम्पनीको head office को जिम्मेबार कर्मचारी बाट लिखित अथवा email को आधार मा खर्च गर्ने पाइने र सोहि अनुसार claim गर्न मात्र पाइने छ।</p>
            </div>

            <div class="responsibilities">
              <h4>जिम्मेवारीहरूः</h4>
              <ul>
                <li>आफ्नो क्षेत्रभित्र उत्पादनहरूको प्रचार-प्रसार र वितरण</li>
                <li>मासिक बिक्री रिपोर्ट बुझाउने</li>
                <li>ग्राहक सन्तुष्टि सुनिश्चित गर्ने</li>
              </ul>
            </div>

            <div class="section">
              <p>हामी तपाईंको साथमा व्यवसायिक सहकार्यमा उच्च आशा राख्दछौं। यो प्रस्ताव स्वीकार भएमा, कृपया <span class="highlight">${data.responseDays || '७'}</span> दिन भित्र हामीलाई लिखित रूपमा जानकारी दिनुहोला।</p>
              <p><strong>धन्यवाद ।</strong></p>
            </div>

            <div class="signature-section">
              <div class="signature-line"></div>
              <p><strong>Celebrate Multi Industries Pvt. Ltd.</strong></p>
              <p>मिति: ${currentDate}</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>सम्पर्क जानकारी:</strong></p>
            <p>Email: support@celebratemulti.com</p>
            <p>Phone: +977-1-XXXXXXX</p>
            <p>Website: www.celebratemulti.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Default template
  private defaultTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Notification</title>
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
            <h1>Notification</h1>
          </div>
          <div class="content">
            <p>${data.message || 'You have a notification from the Distributor Management System.'}</p>
          </div>
          <div class="footer">
            <p>Thank you,<br>Distributor Management Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send distributor approval notification
  async notifyDistributorApproved(applicationData: any, credentials?: any): Promise<void> {
    const template = credentials ? 'distributor_approved_with_credentials' : 'distributor_approved';
    const subject = credentials 
      ? `🎉 Distributor Application Approved - Login Credentials Included`
      : `🎉 Distributor Application Approved - Welcome!`;

    const notification: EmailNotification = {
      to: applicationData.email,
      subject: subject,
      template: template,
      data: {
        ...applicationData,
        ...credentials,
        approvedDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    };

    await this.sendEmail(notification);
  }

  // Send distributor offer letter
  async sendDistributorOfferLetter(applicationData: any, products: any[], additionalData?: any): Promise<void> {
    const subject = `वितरक नियुक्ति प्रस्ताव पत्र - Celebrate Multi Industries Pvt. Ltd.`;

    const notification: EmailNotification = {
      to: applicationData.email,
      subject: subject,
      template: 'distributor_offer_letter',
      data: {
        ...applicationData,
        products: products,
        ...additionalData
      }
    };

    await this.sendEmail(notification);
  }
}

// Create and export Mailjet email service instance
const mailjetEmailService = new MailjetEmailService();

export default mailjetEmailService;
