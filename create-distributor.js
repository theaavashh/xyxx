#!/usr/bin/env node

const axios = require('axios');

// API configuration
const API_BASE_URL = 'http://localhost:4444/api';

// Create distributor application data
const distributorApplication = {
  // Personal Details
  personalDetails: {
    fullName: 'John Distributor',
    age: 35,
    gender: 'पुरुष',
    email: 'john.distributor@example.com',
    mobileNumber: '+9779845678902',
    permanentAddress: 'Mahendrapool, Pokhara-5, Gandaki Province',
    citizenshipNumber: '12-3456-78902',
    issuedDistrict: 'Kaski'
  },
  
  // Business Details
  businessDetails: {
    companyName: 'John Distribution Co.',
    registrationNumber: 'REG-2024-002',
    panVatNumber: '987654321',
    officeAddress: 'Mahendrapool, Pokhara-5',
    operatingArea: 'Gandaki Province',
    desiredDistributorArea: 'Pokhara Valley',
    currentBusiness: 'Wholesale and Retail Distribution',
    businessType: 'Private Limited'
  },
  
  // Staff and Infrastructure
  staffInfrastructure: {
    salesManCount: 8,
    salesManExperience: '5 years average experience in FMCG distribution',
    deliveryStaffCount: 5,
    deliveryStaffExperience: '3 years experience in last-mile delivery',
    accountAssistantCount: 2,
    accountAssistantExperience: '2 years experience in accounting',
    otherStaffCount: 3,
    otherStaffExperience: 'Support staff with various skills',
    warehouseSpace: 2000,
    warehouseDetails: 'Modern warehouse with inventory management system',
    truckCount: 4,
    truckDetails: '2-ton trucks with GPS tracking',
    fourWheelerCount: 2,
    fourWheelerDetails: 'Company vehicles for sales team',
    twoWheelerCount: 6,
    twoWheelerDetails: 'Motorbikes for quick delivery',
    cycleCount: 10,
    cycleDetails: 'Delivery cycles for narrow streets',
    thelaCount: 5,
    thelaDetails: 'Manual carts for local market delivery'
  },
  
  // Business Information
  businessInformation: {
    productCategory: 'Consumer Goods',
    yearsInBusiness: 8,
    monthlySales: 'Above 10 Lakhs',
    storageFacility: 'Own Warehouse with Multiple Locations'
  },
  
  // Current Transactions
  currentTransactions: [
    {
      company: 'Brand A International',
      products: 'Electronics, Home Appliances',
      turnover: '50 Lakhs - 1 Crore'
    },
    {
      company: 'Local Suppliers Pvt Ltd',
      products: 'FMCG Products',
      turnover: '30 - 50 Lakhs'
    }
  ],
  
  // Business Information
  productsToDistribute: [
    {
      productName: 'Smartphones',
      monthlySalesCapacity: '2000+ units'
    },
    {
      productName: 'Home Appliances', 
      monthlySalesCapacity: '500+ units'
    },
    {
      productName: 'FMCG Products',
      monthlySalesCapacity: '5000+ units'
    }
  ],
  
  // Area Coverage
  areaCoverageDetails: [
    {
      distributionArea: 'Pokhara',
      populationEstimate: '500K+',
      competitorBrand: 'Brand X, Brand Y, Brand Z'
    },
    {
      distributionArea: 'Lekhnath',
      populationEstimate: '100K+',
      competitorBrand: 'Local Brands'
    },
    {
      distributionArea: 'Baglung',
      populationEstimate: '150K+',
      competitorBrand: 'Regional Players'
    }
  ],
  
  // Retailer Requirements
  retailerRequirements: {
    preferredProducts: 'All Categories',
    monthlyOrderQuantity: '200+ units',
    paymentPreference: 'Credit with 30 days',
    creditDays: 30,
    deliveryPreference: 'Within 48 hours'
  },
  
  // Partnership Details (optional)
  partnershipDetails: {
    partnerFullName: 'Jane Distributor',
    partnerAge: 32,
    partnerGender: 'महिला',
    partnerCitizenshipNumber: '23-4567-89012',
    partnerIssuedDistrict: 'Chitwan',
    partnerMobileNumber: '+9779876543210',
    partnerEmail: 'jane.distributor@example.com',
    partnerPermanentAddress: 'Mahendrapool, Pokhara-5, Gandaki Province',
    partnerTemporaryAddress: 'Ratnanagar, Chitwan'
  },
  
  // Retailer Requirements
  retailerRequirements: {
    preferredProducts: 'All Categories - Consumer Goods, Electronics, FMCG',
    monthlyOrderQuantity: '200+ units',
    paymentPreference: 'Credit with 30 days',
    creditDays: 30,
    deliveryPreference: 'Within 48 hours'
  },
  
  // Additional Information
  additionalInformation: {
    additionalInfo1: 'Experienced distributor with 8+ years in FMCG and consumer goods distribution',
    additionalInfo2: 'Strong network covering Pokhara Valley and surrounding areas',
    additionalInfo3: 'Ready to invest in marketing, branding and promotion activities'
  },
  
  // Documents (dummy file paths)
  documents: {
    citizenshipId: 'john-citizenship.jpg',
    companyRegistration: 'john-registration.pdf',
    panVatRegistration: 'john-pan.jpg',
    officePhoto: 'john-office.jpg',
    areaMap: 'john-area-map.jpg'
  },
  
  // Declaration
  declaration: {
    declaration: true,
    signature: 'John Distributor',
    date: new Date().toISOString().split('T')[0]
  },
  
  // Agreement
  agreement: {
    agreementAccepted: true,
    distributorSignatureName: 'John Distributor',
    distributorSignatureDate: new Date().toISOString().split('T')[0]
  }
};

// Credentials for the distributor
const distributorCredentials = {
  username: 'johndist',
  email: 'john.distributor@example.com',
  password: 'John@123456!',
  categories: ['category1', 'category2'] // Will be populated after categories are created
};

async function createDistributor() {
  console.log('🚀 Creating New Distributor...');
  console.log('==================================\n');

  try {
    // Step 1: Submit application
    console.log('📋 Step 1: Submitting distributor application...');
    console.log(`   Name: ${distributorApplication.personalDetails.fullName}`);
    console.log(`   Email: ${distributorApplication.personalDetails.email}`);
    console.log(`   Company: ${distributorApplication.businessDetails.companyName}\n`);

    const submitResponse = await axios.post(`${API_BASE_URL}/applications/submit`, distributorApplication, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const application = submitResponse.data.data.application;
    console.log('✅ Application submitted successfully!');
    console.log(`   Application ID: ${application.id}`);
    console.log(`   Reference Number: ${application.referenceNumber || 'Not generated'}\n`);

    // Step 2: Create sample categories
    console.log('📂 Step 2: Creating sample categories...');
    const sampleCategories = [
      { title: 'Consumer Goods', description: 'Daily use consumer products', isActive: true },
      { title: 'Electronics', description: 'Electronic devices and accessories', isActive: true },
      { title: 'Home Appliances', description: 'Household electronic appliances', isActive: true },
      { title: 'FMCG', description: 'Fast Moving Consumer Goods', isActive: true }
    ];

    const createdCategories = [];
    for (const category of sampleCategories) {
      try {
        const catResponse = await axios.post(`${API_BASE_URL}/categories/dev`, category, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        createdCategories.push(catResponse.data.data.id);
        console.log(`   ✅ Created category: ${category.title}`);
      } catch (catError) {
        if (catError.response?.status === 409) {
          // Category already exists, try to get existing category ID
          console.log(`   ⚠️  Category already exists: ${category.title}`);
          // Try to get existing category
          try {
            const getResponse = await axios.get(`${API_BASE_URL}/categories`);
            const existingCat = getResponse.data.data.find(cat => cat.title === category.title);
            if (existingCat) {
              createdCategories.push(existingCat.id);
            }
          } catch (getError) {
            console.log(`   ⚠️  Could not retrieve existing category: ${category.title}`);
          }
        } else {
          console.log(`   ❌ Error creating category ${category.title}:`, catError.response?.data?.message || catError.message);
        }
      }
    }

    // Step 3: Approve the application
    console.log('\n✅ Step 3: Approving distributor application...');
    const approveResponse = await axios.put(`${API_BASE_URL}/applications/dev/${application.id}/status`, {
      status: 'APPROVED',
      reviewNotes: 'Approved for testing - Well-qualified distributor with strong business background'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Application approved successfully!');
    console.log(`   Status: ${approveResponse.data.data.status}\n`);

    // Step 4: Create distributor credentials
    console.log('🔐 Step 4: Creating distributor user credentials...');
    const credentialsData = {
      username: distributorCredentials.username,
      email: distributorCredentials.email,
      password: distributorCredentials.password,
      categories: createdCategories.length > 0 ? createdCategories : []
    };

    const credResponse = await axios.post(`${API_BASE_URL}/distributors/${application.id}/credentials`, credentialsData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Distributor credentials created successfully!');
    console.log(`   Username: ${distributorCredentials.username}`);
    console.log(`   Email: ${distributorCredentials.email}`);
    console.log(`   Password: ${distributorCredentials.password}`);
    console.log(`   Categories Assigned: ${createdCategories.length}\n`);

    // Step 5: Test login
    console.log('🔑 Step 5: Testing distributor login...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: distributorCredentials.email,
        password: distributorCredentials.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (loginResponse.data.success) {
        console.log('✅ Login successful!');
        console.log(`   Token: ${loginResponse.data.data.token.substring(0, 50)}...`);
        console.log(`   Role: ${loginResponse.data.data.user.role}`);
        console.log(`   User ID: ${loginResponse.data.data.user.id}\n`);
      }
    } catch (loginError) {
      console.log('❌ Login test failed:', loginError.response?.data?.message || loginError.message);
    }

    // Final Summary
    console.log('🎉 DISTRIBUTOR CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`👤 Distributor: ${distributorApplication.personalDetails.fullName}`);
    console.log(`🏢 Company: ${distributorApplication.businessDetails.companyName}`);
    console.log(`📧 Email: ${distributorCredentials.email}`);
    console.log(`👤 Username: ${distributorCredentials.username}`);
    console.log(`🔒 Password: ${distributorCredentials.password}`);
    console.log(`🆔 App ID: ${application.id}`);
    console.log(`📄 Reference: ${application.referenceNumber || 'Generated after approval'}`);
    console.log(`📍 Area: ${distributorApplication.businessDetails.desiredDistributorArea}`);
    console.log(`📊 Business: ${distributorApplication.businessDetails.currentBusiness}`);
    console.log('='.repeat(50));
    console.log('\n📱 You can now login to distributor panel with these credentials!');
    console.log(`🌐 Panel URL: http://localhost:3001 (or where distributor-panel is running)`);

  } catch (error) {
    console.error('❌ Error creating distributor:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 API server not found. Make sure distributor API is running:');
      console.log('   cd distributor-api && npm run dev');
      console.log('   Server should be on: http://localhost:4444');
    } else if (error.response?.status === 500) {
      console.log('\n💡 Server error. Check API server logs:');
      console.log('   cd distributor-api && tail -f server.log');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. API server is not running or wrong port.');
    }
  }
}

// Check prerequisites
async function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  try {
    // Check if API is running
    console.log('   Checking API server...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('   ✅ API server is running');
  } catch (error) {
    console.log('   ❌ API server is not running or not accessible');
    console.log('   💡 Start the distributor API first:');
    console.log('       cd distributor-api && npm run dev');
    process.exit(1);
  }
  
  console.log('   ✅ All prerequisites met\n');
}

// Main execution
async function main() {
  console.log('🛍️  Create New Distributor');
  console.log('============================\n');
  
  await checkPrerequisites();
  await createDistributor();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createDistributor,
  distributorApplication,
  distributorCredentials
};