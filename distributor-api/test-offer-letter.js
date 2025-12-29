const Mailjet = require('node-mailjet');
require('dotenv').config();

async function testDistributorOfferLetter() {
  console.log('🧪 Testing Distributor Offer Letter Template (Nepali)...');
  
  const mailjet = Mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);
  
  const applicationData = {
    applicationId: 'APP-123456',
    fullName: 'राम बहादुर श्रेष्ठ',
    email: 'aavash.ganeju@gmail.com',
    contactNumber: '9841234567',
    address: 'काठमाडौं, नेपाल',
    companyName: 'ABC Distributors Pvt. Ltd.',
    distributionArea: 'काठमाडौं उपत्यका',
    businessType: 'SOLE_PROPRIETORSHIP'
  };

  const products = [
    {
      name: 'Buff Achar',
      units: '500gm',
      packaging: 'Plastic Bottle',
      distributorPrice: '500',
      wholesalePrice: '525',
      rate: '575',
      mrp: '700'
    },
    {
      name: 'Mutton Achar',
      units: '500gm',
      packaging: 'Plastic Bottle',
      distributorPrice: '550',
      wholesalePrice: '575',
      rate: '625',
      mrp: '750'
    },
    {
      name: 'Pork Achar',
      units: '500gm',
      packaging: 'Plastic Bottle',
      distributorPrice: '600',
      wholesalePrice: '625',
      rate: '675',
      mrp: '800'
    }
  ];

  const additionalData = {
    responseDays: '7'
  };

  // Generate the HTML template (copied from our service)
  const currentDate = new Date().toLocaleDateString('ne-NP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const productTableRows = products.map((product, index) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${product.name}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${product.units}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${product.packaging}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. ${product.distributorPrice}/-</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. ${product.wholesalePrice}/-</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. ${product.rate}/-</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">रु. ${product.mrp}/-</td>
    </tr>
  `).join('');

  const htmlTemplate = `
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
              <span class="info-value">${applicationData.fullName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ठेगाना:</span>
              <span class="info-value">${applicationData.address}</span>
            </div>
            <div class="info-row">
              <span class="info-label">सम्पर्क नम्बर:</span>
              <span class="info-value">${applicationData.contactNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">इमेल:</span>
              <span class="info-value">${applicationData.email}</span>
            </div>
          </div>

          <div class="section">
            <p><strong>महोदय,</strong></p>
            <p>Celebrate Multi Industries Pvt. Ltd. ले तपाईंलाई हाम्रो आधिकारिक वितरकको रूपमा नियुक्त गर्न प्रस्ताव गर्दछ। तपाईंले प्रदान गरेको विवरण, अनुभव र व्यावसायिक क्षमतालाई विचार गरी यो निर्णय गरिएको छ।</p>
          </div>

          <div class="section">
            <h3>१. वितरक क्षेत्रः</h3>
            <p><span class="highlight">${applicationData.distributionArea}</span> - यस क्षेत्रमा तपाईंले वितरण गर्नुपर्ने छ।</p>
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
            <p>हामी तपाईंको साथमा व्यवसायिक सहकार्यमा उच्च आशा राख्दछौं। यो प्रस्ताव स्वीकार भएमा, कृपया <span class="highlight">${additionalData.responseDays}</span> दिन भित्र हामीलाई लिखित रूपमा जानकारी दिनुहोला।</p>
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
              Email: applicationData.email,
              Name: applicationData.fullName
            }
          ],
          Subject: 'वितरक नियुक्ति प्रस्ताव पत्र - Celebrate Multi Industries Pvt. Ltd.',
          HTMLPart: htmlTemplate,
          TextPart: `प्रिय ${applicationData.fullName}, Celebrate Multi Industries Pvt. Ltd. ले तपाईंलाई आधिकारिक वितरकको रूपमा नियुक्त गर्न प्रस्ताव गर्दछ।`
        }
      ]
    });

    const result = await request;
    console.log('✅ Distributor offer letter sent successfully!');
    console.log('📧 Email sent to:', applicationData.email);
    console.log('📝 Message ID:', result.body.Messages[0].To[0].MessageID);
    console.log('📊 Status:', result.body.Messages[0].Status);
    console.log('🏢 Company:', applicationData.companyName);
    console.log('👤 Distributor:', applicationData.fullName);
    console.log('📍 Distribution Area:', applicationData.distributionArea);
    console.log('📦 Products included:', products.length);
    
  } catch (error) {
    console.error('❌ Failed to send distributor offer letter:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', error.response.body);
    }
  }
}

testDistributorOfferLetter();

















