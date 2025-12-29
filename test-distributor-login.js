#!/usr/bin/env node

const axios = require('axios');

// API configuration
const API_BASE_URL = 'http://localhost:4444/api';

// Test login credentials
const testCredentials = {
  email: 'john.distributor@example.com',
  password: 'John@123456!'
};

// Test distributor panel endpoints
async function testDistributorPanel() {
  console.log('🔑 Testing Distributor Panel Login\n');
  console.log('='.repeat(40));

  try {
    // Step 1: Login with distributor credentials
    console.log('\n📱 Step 1: Attempting login...');
    console.log(`   Email: ${testCredentials.email}`);
    console.log(`   Password: ${testCredentials.password}\n`);
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testCredentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (loginResponse.data.success) {
      const userData = loginResponse.data.data;
      
      console.log('✅ Login successful!');
      console.log('   Login Response:', JSON.stringify(userData, null, 2));
      
      // Handle different response structures
      const user = userData.user || userData;
      const token = userData.token;
      
      console.log(`   Username: ${user.username || 'Not found'}`);
      console.log(`   Full Name: ${user.fullName || user.username || 'Not found'}`);
      console.log(`   Role: ${user.role || 'Not found'}`);
      console.log(`   Email: ${user.email || 'Not found'}`);
      console.log(`   Token: ${token ? token.substring(0, 30) + '...' : 'Not found'}\n`);

      // Store token for authenticated requests
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Step 2: Test getting user profile
      console.log('👤 Step 2: Testing user profile...');
      try {
        const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: authHeaders
        });
        
        console.log('✅ Profile access successful!');
        console.log(`   Profile fetched for: ${profileResponse.data.data.fullName}`);
        console.log(`   Department: ${profileResponse.data.data.department || 'N/A'}`);
        console.log(`   Position: ${profileResponse.data.data.position || 'N/A'}\n`);
      } catch (profileError) {
        console.log('❌ Profile access failed:', profileError.response?.data?.message || profileError.message);
      }

      // Step 3: Test getting distributor specific data
      console.log('📊 Step 3: Testing distributor data access...');
      try {
        // Test getting products
        const productsResponse = await axios.get(`${API_BASE_URL}/products`, {
          headers: authHeaders
        });
        console.log('✅ Products access successful!');
        console.log(`   Total products: ${productsResponse.data.data?.length || 0}\n`);

        // Test getting categories
        const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`, {
          headers: authHeaders
        });
        console.log('✅ Categories access successful!');
        console.log(`   Total categories: ${categoriesResponse.data.data?.length || 0}\n`);

        // Test getting orders (if endpoint exists)
        try {
          const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, {
            headers: authHeaders
          });
          console.log('✅ Orders access successful!');
          console.log(`   Total orders: ${ordersResponse.data.data?.length || 0}\n`);
        } catch (ordersError) {
          console.log('⚠️  Orders endpoint not available or accessible');
        }

      } catch (dataError) {
        console.log('❌ Data access failed:', dataError.response?.data?.message || dataError.message);
      }

      // Step 4: Test logout
      console.log('🚪 Step 4: Testing logout...');
      try {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: authHeaders
        });
        console.log('✅ Logout successful!\n');
      } catch (logoutError) {
        console.log('⚠️  Logout failed:', logoutError.response?.data?.message || logoutError.message);
      }

      console.log('🎉 Distributor Panel Test Complete!');
      console.log('='.repeat(40));
      console.log('\n✅ The distributor account is working correctly!');
      console.log('📱 You can now login to distributor panel with:');
      console.log(`   Email: ${testCredentials.email}`);
      console.log(`   Password: ${testCredentials.password}`);
      console.log(`   API: ${API_BASE_URL}`);

    } else {
      console.log('❌ Login failed - Invalid response format');
    }

  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Possible reasons:');
      console.log('   - Account not created yet (run create-approved-distributor.js first)');
      console.log('   - Incorrect credentials');
      console.log('   - Account is inactive');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Make sure distributor API server is running on http://localhost:4444');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 API server is not running. Start the distributor API first:');
      console.log('   cd distributor-api && npm run dev');
    }
  }
}

// Function to check if user exists
async function checkUserExists() {
  console.log('🔍 Checking if distributor user exists...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testCredentials);
    
    if (response.data.success) {
      console.log('✅ Distributor user exists and can login!\n');
      return true;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Distributor user does not exist or credentials are wrong\n');
      console.log('💡 Run "node create-approved-distributor.js" first to create the distributor\n');
    }
  }
  
  return false;
}

// Main function
async function main() {
  console.log('🛍️ Distributor Panel Login Test');
  console.log('=============================\n');
  
  // Check if user exists first
  const userExists = await checkUserExists();
  
  if (userExists) {
    // Test full panel functionality
    await testDistributorPanel();
  }
}

// Run script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testDistributorPanel,
  checkUserExists,
  testCredentials
};