const Mailjet = require('node-mailjet');

// Test Mailjet API connection
async function testMailjet() {
  console.log('Testing Mailjet API connection...');
  
  // Check if environment variables are set
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET');
  console.log('Secret Key:', secretKey ? `${secretKey.substring(0, 8)}...` : 'NOT SET');
  
  if (!apiKey || !secretKey) {
    console.error('❌ Mailjet credentials not found in environment variables');
    console.log('Please set MAILJET_API_KEY and MAILJET_SECRET_KEY in your .env file');
    return;
  }
  
  try {
    // Initialize Mailjet
    const mailjet = Mailjet.apiConnect(apiKey, secretKey);
    console.log('✅ Mailjet client initialized successfully');
    
    // Test sending an email
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL || 'test@example.com',
            Name: process.env.MAILJET_FROM_NAME || 'Test Sender'
          },
          To: [
            {
              Email: 'aavash.ganeju@gmail.com',
              Name: 'Test Recipient'
            }
          ],
          Subject: 'Test Email from Mailjet Integration',
          HTMLPart: `
            <h1>🎉 Mailjet Integration Test</h1>
            <p>This is a test email to verify that the Mailjet integration is working correctly.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          `,
          TextPart: 'Mailjet Integration Test - This is a test email to verify the integration is working.'
        }
      ]
    });

    const result = await request;
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.body.Messages[0].To[0].MessageID);
    console.log('Status:', result.body.Messages[0].Status);
    
  } catch (error) {
    console.error('❌ Mailjet test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', error.response.body);
    }
  }
}

// Load environment variables
require('dotenv').config();

// Run the test
testMailjet();











