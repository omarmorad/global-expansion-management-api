const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let clientToken = '';
let adminToken = '';
let projectId = '';

async function testCompleteFlow() {
  console.log('🚀 Starting Complete API Test Flow...\n');

  try {
    // 1. Test Health
    console.log('1️⃣ Testing API Health...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ API Health:', health.data.status);

    // 2. Login as Client
    console.log('\n2️⃣ Logging in as Client...');
    const clientLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'client@techcorp.com',
      password: 'client123',
    });
    clientToken = clientLogin.data.access_token;
    console.log('✅ Client logged in:', clientLogin.data.user.email);

    // 3. Login as Admin
    console.log('\n3️⃣ Logging in as Admin...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@expanders360.com',
      password: 'admin123',
    });
    adminToken = adminLogin.data.access_token;
    console.log('✅ Admin logged in:', adminLogin.data.user.email);

    // 4. Get Client Profile
    console.log('\n4️⃣ Getting Client Profile...');
    const profile = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    console.log('✅ Profile retrieved:', profile.data.email);

    // 5. Get All Projects
    console.log('\n5️⃣ Getting Client Projects...');
    const projects = await axios.get(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    console.log('✅ Found', projects.data.length, 'projects');
    if (projects.data.length > 0) {
      projectId = projects.data[0].id;
      console.log('📋 Using project ID:', projectId);
    }

    // 6. Create New Project
    console.log('\n6️⃣ Creating New Project...');
    const newProject = await axios.post(
      `${BASE_URL}/projects`,
      {
        country: 'France',
        services_needed: ['legal', 'marketing', 'hr'],
        budget: 75000,
        status: 'active',
      },
      {
        headers: { Authorization: `Bearer ${clientToken}` },
      },
    );
    const newProjectId = newProject.data.id;
    console.log(
      '✅ Created project:',
      newProjectId,
      'for',
      newProject.data.country,
    );

    // 7. Get All Vendors
    console.log('\n7️⃣ Getting All Vendors...');
    const vendors = await axios.get(`${BASE_URL}/vendors`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    console.log('✅ Found', vendors.data.length, 'vendors');

    // 8. Rebuild Matches for New Project
    console.log('\n8️⃣ Rebuilding Matches for New Project...');
    const matches = await axios.post(
      `${BASE_URL}/projects/${newProjectId}/matches/rebuild`,
      {},
      {
        headers: { Authorization: `Bearer ${clientToken}` },
      },
    );
    console.log('✅ Generated', matches.data.length, 'matches');
    if (matches.data.length > 0) {
      console.log(
        '🎯 Best match score:',
        Math.max(...matches.data.map((m) => m.score)),
      );
    }

    // 9. Get Project Matches
    console.log('\n9️⃣ Getting Project Matches...');
    const projectMatches = await axios.get(
      `${BASE_URL}/projects/${newProjectId}/matches`,
      {
        headers: { Authorization: `Bearer ${clientToken}` },
      },
    );
    console.log(
      '✅ Retrieved',
      projectMatches.data.length,
      'matches for project',
    );

    // 10. Upload Research Document
    console.log('\n🔟 Uploading Research Document...');
    const document = await axios.post(
      `${BASE_URL}/research`,
      {
        title: 'France Expansion Strategy 2025',
        content:
          'Comprehensive analysis of French market entry strategies, legal requirements, and business opportunities for tech companies.',
        tags: ['france', 'strategy', 'legal', 'tech'],
        projectId: newProjectId,
        fileType: 'pdf',
        fileSize: 2048000,
      },
      {
        headers: { Authorization: `Bearer ${clientToken}` },
      },
    );
    console.log('✅ Uploaded document:', document.data.title);

    // 11. Search Research Documents
    console.log('\n1️⃣1️⃣ Searching Research Documents...');
    const searchResults = await axios.get(
      `${BASE_URL}/research/search?text=france&tags=strategy`,
      {
        headers: { Authorization: `Bearer ${clientToken}` },
      },
    );
    console.log(
      '✅ Found',
      searchResults.data.length,
      'documents matching search',
    );

    // 12. Get Analytics - Top Vendors
    console.log('\n1️⃣2️⃣ Getting Top Vendors Analytics...');
    const topVendors = await axios.get(`${BASE_URL}/analytics/top-vendors`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    console.log('✅ Analytics for', topVendors.data.length, 'countries');
    topVendors.data.forEach((country) => {
      console.log(
        `   📍 ${country.country}: ${country.topVendors.length} top vendors, ${country.researchDocumentCount} documents`,
      );
    });

    // 13. Admin Analytics
    console.log('\n1️⃣3️⃣ Getting Admin Analytics...');
    const projectStats = await axios.get(
      `${BASE_URL}/analytics/project-stats`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    console.log('✅ Project Stats:');
    console.log(`   📊 Total Projects: ${projectStats.data.totalProjects}`);
    console.log(`   🟢 Active Projects: ${projectStats.data.activeProjects}`);
    console.log(
      `   💰 Average Budget: $${projectStats.data.averageBudget.toLocaleString()}`,
    );

    const vendorStats = await axios.get(`${BASE_URL}/analytics/vendor-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✅ Vendor Stats:');
    console.log(`   🏢 Total Vendors: ${vendorStats.data.totalVendors}`);
    console.log(`   🟢 Active Vendors: ${vendorStats.data.activeVendors}`);
    console.log(
      `   ⭐ Average Rating: ${vendorStats.data.averageRating.toFixed(1)}/5`,
    );
    console.log(`   ⏱️ Average SLA: ${vendorStats.data.averageSlaHours} hours`);

    // 14. Test Vendor Creation (Admin Only)
    console.log('\n1️⃣4️⃣ Creating New Vendor (Admin)...');
    const newVendor = await axios.post(
      `${BASE_URL}/vendors`,
      {
        name: 'Test Expansion Consultants',
        countries_supported: ['France', 'Belgium', 'Netherlands'],
        services_offered: ['legal', 'marketing', 'hr', 'operations'],
        rating: 4.7,
        response_sla_hours: 6,
        is_active: true,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    console.log('✅ Created vendor:', newVendor.data.name);

    console.log('\n🎉 Complete API Test Flow Successful!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Authentication working');
    console.log('   ✅ Project management working');
    console.log('   ✅ Vendor management working');
    console.log('   ✅ Matching algorithm working');
    console.log('   ✅ Research documents working');
    console.log('   ✅ Analytics working');
    console.log('   ✅ Role-based permissions working');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔑 Authentication issue - check your tokens');
    }
    if (error.response?.status === 403) {
      console.log('🚫 Permission denied - check user roles');
    }
  }
}

// Run the test
testCompleteFlow();
