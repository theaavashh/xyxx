const Mailjet = require('node-mailjet');
require('dotenv').config();

async function testDistributorApprovalEmail() {
  console.log('🧪 Testing Distributor Approval Email Template...');
  
  const mailjet = Mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);
  
  const testData = {
    applicationId: 'APP-123456',
    fullName: 'John Doe',
    email: 'aavash.ganeju@gmail.com',
    companyName: 'ABC Distributors Pvt. Ltd.',
    distributionArea: 'Kathmandu Valley',
    businessType: 'SOLE_PROPRIETORSHIP',
    reviewNotes: 'This is a test approval email with credentials',
    approvedDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  const credentials = {
    username: 'dist_abc123',
    email: 'aavash.ganeju@gmail.com',
    password: 'TempPass123!',
    categories: [
      { id: '1', title: 'ZipZip Achar', description: 'Mutton Achar, Pork Achar' },
      { id: '2', title: 'सुकुटी', description: 'Various dry meat products' }
    ]
  };

  try {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL || 'aavash.ganeju@gmail.com',
            Name: process.env.MAILJET_FROM_NAME || 'Celebrate Multi Industries'
          },
          To: [
            {
              Email: testData.email,
              Name: testData.fullName
            }
          ],
          Subject: '🎉 Distributor Application Approved - Login Credentials Included',
          HTMLPart: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Distributor Application Approved</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 40px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                .content { padding: 40px 20px; background-color: #ffffff; }
                .success-badge { background-color: #d4edda; border: 2px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
                .success-badge h2 { margin: 0 0 10px 0; color: #155724; font-size: 24px; }
                .credentials-section { background-color: #fff3cd; border: 2px solid #ffeaa7; color: #856404; padding: 25px; border-radius: 10px; margin: 25px 0; }
                .credentials-section h3 { margin: 0 0 20px 0; color: #856404; font-size: 20px; }
                .credential-item { background-color: #ffffff; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ffc107; }
                .credential-item strong { color: #495057; display: block; margin-bottom: 5px; }
                .credential-value { font-family: 'Courier New', monospace; background-color: #f8f9fa; padding: 8px 12px; border-radius: 4px; font-size: 16px; font-weight: bold; color: #2c3e50; }
                .info-section { background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4CAF50; }
                .info-section h3 { margin: 0 0 15px 0; color: #2c3e50; font-size: 18px; }
                .warning-section { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; margin: 25px 0; }
                .warning-section h4 { margin: 0 0 10px 0; color: #721c24; }
                .footer { padding: 30px 20px; text-align: center; color: #6c757d; background-color: #f8f9fa; border-top: 1px solid #dee2e6; }
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
                  
                  <p>Dear <strong>${testData.fullName}</strong>,</p>
                  
                  <p>We are delighted to inform you that your distributor application has been successfully approved. Your distributor account has been created and is ready for use.</p>
                  
                  <div class="credentials-section">
                    <h3>🔐 Your Login Credentials</h3>
                    <p style="margin: 0 0 20px 0;">Please save these credentials securely:</p>
                    
                    <div class="credential-item">
                      <strong>Username:</strong>
                      <div class="credential-value">${credentials.username}</div>
                    </div>
                    
                    <div class="credential-item">
                      <strong>Password:</strong>
                      <div class="credential-value">${credentials.password}</div>
                    </div>
                    
                    <div class="credential-item">
                      <strong>Email:</strong>
                      <div class="credential-value">${credentials.email}</div>
                    </div>
                  </div>
                  
                  <div class="warning-section">
                    <h4>⚠️ Important Security Notice</h4>
                    <p>Please change your password immediately after your first login for security purposes. Do not share these credentials with anyone.</p>
                  </div>
                  
                  <div class="info-section">
                    <h3>📋 Application Details</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                      <li style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong style="color: #495057; display: inline-block; width: 140px;">Application ID:</strong> ${testData.applicationId}</li>
                      <li style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong style="color: #495057; display: inline-block; width: 140px;">Company:</strong> ${testData.companyName}</li>
                      <li style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong style="color: #495057; display: inline-block; width: 140px;">Approved Date:</strong> ${testData.approvedDate}</li>
                      <li style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong style="color: #495057; display: inline-block; width: 140px;">Distribution Area:</strong> ${testData.distributionArea}</li>
                      <li style="padding: 8px 0;"><strong style="color: #495057; display: inline-block; width: 140px;">Business Type:</strong> ${testData.businessType}</li>
                    </ul>
                  </div>
                  
                  <div class="info-section">
                    <h3>📦 Assigned Product Categories</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                      ${credentials.categories.map(cat => `<li>${cat.title}</li>`).join('')}
                    </ul>
                  </div>
                  
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
          `,
          TextPart: `Congratulations ${testData.fullName}! Your distributor application has been approved. Your login credentials: Username: ${credentials.username}, Password: ${credentials.password}`
        }
      ]
    });

    const result = await request;
    console.log('✅ Distributor approval email sent successfully!');
    console.log('📧 Email sent to:', testData.email);
    console.log('📝 Message ID:', result.body.Messages[0].To[0].MessageID);
    console.log('📊 Status:', result.body.Messages[0].Status);
    console.log('🏢 Company:', testData.companyName);
    console.log('👤 Distributor:', testData.fullName);
    console.log('🔑 Username:', credentials.username);
    console.log('🔒 Password:', credentials.password);
    
  } catch (error) {
    console.error('❌ Failed to send distributor approval email:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', error.response.body);
    }
  }
}

testDistributorApprovalEmail();
