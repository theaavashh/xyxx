#!/usr/bin/env node

const axios = require('axios');
const crypto = require('crypto');

// API configuration
const API_BASE_URL = 'http://localhost:4444/api';

// Test data for creating an approved distributor
const testDistributor = {
  fullName: 'Test Approved Distributor',
  email: 'test.distributor@example.com',
  mobileNumber: '+9779845678901',
  permanentAddress: 'Kathmandu, Nepal',
  citizenshipNumber: '12-3456-78901',
  issuedDistrict: 'Kathmandu',
  
  // Business Details
  companyName: 'Test Distribution Company',
  registrationNumber: 'REG-2024-001',
  panVatNumber: '123456789',
  officeAddress: 'New Road, Kathmandu',
  operatingArea: 'Kathmandu Valley',
  desiredDistributorArea: 'Kathmandu',
  currentBusiness: 'Retail and Wholesale Distribution',
  businessType: 'Private Limited',
  
  // Infrastructure
  salesManCount: 5,
  deliveryStaffCount: 3,
  accountAssistantCount: 1,
  otherStaffCount: 2,
  warehouseSpace: 1000,
  truckCount: 2,
  fourWheelerCount: 1,
  twoWheelerCount: 3,
  
  // Business Info
  productCategory: 'Electronics',
  yearsInBusiness: 5,
  monthlySales: 'Above 5 Lakhs',
  storageFacility: 'Own Warehouse with Cold Storage',
  
  // Products to distribute
  productsToDistribute: [
    { productName: 'Smartphones', monthlySalesCapacity: '1000+ units' },
    { productName: 'Laptops', monthlySalesCapacity: '500+ units' },
    { productName: 'Accessories', monthlySalesCapacity: '2000+ units' }
  ],
  
  // Area coverage
  areaCoverageDetails: [
    { distributionArea: 'Kathmandu', populationEstimate: '1M+', competitorBrand: 'Brand X, Brand Y' },
    { distributionArea: 'Lalitpur', populationEstimate: '500K+', competitorBrand: 'Brand Z' },
    { distributionArea: 'Bhaktapur', populationEstimate: '300K+', competitorBrand: 'Brand A' }
  ],
  
  // Retailer requirements
  retailerRequirements: {
    preferredProducts: 'All Electronics Categories',
    monthlyOrderQuantity: '100+ units',
    paymentPreference: 'Cash on Delivery',
    creditDays: 7,
    deliveryPreference: 'Within 24 hours'
  },
  
  // Documents (dummy file paths)
  documents: {
    citizenshipId: 'test-citizenship.jpg',
    companyRegistration: 'test-registration.pdf',
    panVatRegistration: 'test-pan.jpg'
  },
  
  // Declaration
  declaration: {
    declaration: true,
    signature: 'Test Approved Distributor',
    date: new Date().toISOString().split('T')[0]
  },
  
  // Agreement
  agreement: {
    agreementAccepted: true,
    distributorSignatureName: 'Test Approved Distributor',
    distributorSignatureDate: new Date().toISOString().split('T')[0]
  }
};

// Distributor credentials for login
const distributorCredentials = {
  username: 'testdistributor',
  email: 'test.distributor@example.com',
  password: 'Test123456!',
  categories: [] // Will assign categories after creation
};

async function createApprovedDistributor() {
  console.log('🚀 Starting distributor creation process...\n');

  try {
    // Step 1: Submit distributor application
    console.log('📝 Step 1: Submitting distributor application...');
    const submitResponse = await axios.post(`${API_BASE_URL}/applications/submit`, testDistributor, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const application = submitResponse.data.data;
    console.log('✅ Application submitted successfully!');
    console.log(`   Application ID: ${application.id}`);
    console.log(`   Reference Number: ${application.referenceNumber}\n`);

    // Step 2: Approve the application
    console.log('✅ Step 2: Approving the application...');
    const approveResponse = await axios.put(`${API_BASE_URL}/applications/dev/${application.id}/status`, {
      status: 'APPROVED',
      reviewNotes: 'Auto-approved for testing purposes'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Application approved successfully!');
    console.log(`   Status: ${approveResponse.data.data.status}\n`);

    // Step 3: Create distributor credentials and user account
    console.log('🔐 Step 3: Creating distributor credentials...');
    const credentialsResponse = await axios.post(`${API_BASE_URL}/distributors/${application.id}/credentials`, {
      username: distributorCredentials.username,
      email: distributorCredentials.email,
      password: distributorCredentials.password,
      categories: distributorCredentials.categories
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Distributor credentials created successfully!');
    console.log(`   Username: ${distributorCredentials.username}`);
    console.log(`   Email: ${distributorCredentials.email}`);
    console.log(`   Password: ${distributorCredentials.password}\n`);

    // Step 4: Test login with distributor panel
    console.log('🔑 Step 4: Testing distributor login...');
    
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
        console.log(`   User Role: ${loginResponse.data.data.user.role}`);
        console.log(`   User ID: ${loginResponse.data.data.user.id}\n`);
      }
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
    }

    // Step 5: Display final information
    console.log('🎉 Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Approved distributor created successfully!`);
    console.log(`📧 Email: ${distributorCredentials.email}`);
    console.log(`👤 Username: ${distributorCredentials.username}`);
    console.log(`🔒 Password: ${distributorCredentials.password}`);
    console.log(`🆔 Application ID: ${application.id}`);
    console.log(`📄 Reference: ${application.referenceNumber}`);
    console.log('='.repeat(50));
    console.log('\n📱 You can now use these credentials to login to the distributor panel!');

  } catch (error) {
    console.error('❌ Error during distributor creation:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Make sure the distributor API server is running on http://localhost:4444');
    } else if (error.response?.status === 500) {
      console.log('\n💡 Check server logs for detailed error information');
    }
  }
}

// Additional function to create sample categories if needed
async function createSampleCategories() {
  console.log('\n📂 Checking/Creating sample categories...');
  
  const sampleCategories = [
    { title: 'Electronics', description: 'Electronic devices and accessories', isActive: true },
    { title: 'Clothing', description: 'Fashion and apparel', isActive: true },
    { title: 'Food & Beverages', description: 'Food items and drinks', isActive: true },
    { title: 'Home & Garden', description: 'Household items and garden supplies', isActive: true }
  ];

  try {
    for (const category of sampleCategories) {
      try {
        await axios.post(`${API_BASE_URL}/categories/dev`, category, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Created category: ${category.title}`);
      } catch (catError) {
        if (catError.response?.status !== 409) { // Skip if category already exists
          console.log(`⚠️  Warning with category ${category.title}:`, catError.response?.data?.message || catError.message);
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Category creation skipped (server might not need it)');
  }
}

// Check if we should create categories first
async function main() {
  console.log('🎯 Distributor Creation Script');
  console.log('========================\n');
  
  // Create sample categories first
  await createSampleCategories();
  
  // Then create the approved distributor
  await createApprovedDistributor();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createApprovedDistributor,
  createSampleCategories,
  testDistributor,
  distributorCredentials
};