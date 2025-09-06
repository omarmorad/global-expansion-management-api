const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing Global Expansion Management API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', health.data.status);

    // Test registration
    console.log('\n2. Testing user registration...');
    const registerData = {
      company_name: 'Test Company',
      email: 'test@example.com',
      password: 'test123456',
      role: 'client',
    };

    try {
      const register = await axios.post(
        `${BASE_URL}/auth/register`,
        registerData,
      );
      console.log('✅ Registration successful');
    } catch (error) {
      if (
        error.response?.status === 401 &&
        error.response?.data?.message === 'Email already exists'
      ) {
        console.log('ℹ️  User already exists, continuing...');
      } else {
        throw error;
      }
    }

    // Test login
    console.log('\n3. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'test123456',
    };

    const login = await axios.post(`${BASE_URL}/auth/login`, loginData);
    const token = login.data.access_token;
    console.log('✅ Login successful, token received');

    // Test protected endpoint
    console.log('\n4. Testing protected endpoint...');
    const profile = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Profile retrieved:', profile.data.email);

    // Test projects endpoint
    console.log('\n5. Testing projects endpoint...');
    const projects = await axios.get(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Projects retrieved:', projects.data.length, 'projects');

    // Test vendors endpoint
    console.log('\n6. Testing vendors endpoint...');
    const vendors = await axios.get(`${BASE_URL}/vendors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Vendors retrieved:', vendors.data.length, 'vendors');

    // Test analytics endpoint
    console.log('\n7. Testing analytics endpoint...');
    const analytics = await axios.get(`${BASE_URL}/analytics/top-vendors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Analytics retrieved:', analytics.data.length, 'countries');

    console.log('\n🎉 All tests passed! API is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests if axios is available
if (typeof require !== 'undefined') {
  try {
    testAPI();
  } catch (error) {
    console.log('⚠️  To run API tests, install axios: npm install axios');
    console.log('Then run: node test-api.js');
  }
} else {
  console.log('This script requires Node.js to run');
}
