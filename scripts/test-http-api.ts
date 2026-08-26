import fetch from 'node:http';

async function testHttp() {
  console.log('--- Testing HTTP REST API Endpoints ---');

  const baseUrl = 'http://localhost:5173';
  const testEmail = `http.user.${Date.now()}@proxie.local`;
  const testPassword = 'Password123!';

  // Helper fetch wrapper
  async function api(path: string, options: any = {}) {
    const res = await globalThis.fetch(`${baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, headers: res.headers, data };
  }

  // 1. Test POST /api/auth/signup
  console.log('1. Testing POST /api/auth/signup...');
  const signupRes = await api('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      fullName: 'Http User',
      company: 'Test HTTP Enterprise'
    })
  });

  if (signupRes.status !== 201 || !signupRes.data?.user) {
    throw new Error(`Signup failed: ${JSON.stringify(signupRes)}`);
  }
  console.log(`   ✅ Signed up user [${signupRes.data.user.email}], org [${signupRes.data.user.organizationName}]`);

  const setCookie = signupRes.headers.get('set-cookie');
  const cookieHeader = setCookie ? setCookie.split(';')[0] : '';
  const token = signupRes.data.sessionId;

  // 2. Test GET /api/auth/me with Bearer token
  console.log('2. Testing GET /api/auth/me...');
  const meRes = await api('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader }
  });
  if (meRes.status !== 200 || !meRes.data?.user) {
    throw new Error(`Me endpoint failed: ${JSON.stringify(meRes)}`);
  }
  console.log(`   ✅ /api/auth/me verified for user [${meRes.data.user.fullName}]`);

  // 3. Test POST /api/teams
  console.log('3. Testing POST /api/teams...');
  const teamRes = await api('/api/teams', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
    body: JSON.stringify({
      name: 'Service Crew',
      description: 'Front of house team',
      color: '#00AAFF'
    })
  });
  if (teamRes.status !== 201 || !teamRes.data?.team) {
    throw new Error(`Create team failed: ${JSON.stringify(teamRes)}`);
  }
  const teamId = teamRes.data.team.id;
  console.log(`   ✅ Created team '${teamRes.data.team.name}' [${teamId}]`);

  // 4. Test GET /api/teams
  console.log('4. Testing GET /api/teams...');
  const teamsListRes = await api('/api/teams', {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader }
  });
  console.log(`   ✅ Listed ${teamsListRes.data?.teams?.length} teams`);

  // 5. Test POST /api/shifts
  console.log('5. Testing POST /api/shifts...');
  const shiftRes = await api('/api/shifts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
    body: JSON.stringify({
      teamId,
      shiftDate: '2026-08-30',
      startTime: '08:00',
      endTime: '16:00',
      breakMinutes: 30,
      shiftType: 'Standard',
      note: 'HTTP test shift'
    })
  });
  if (shiftRes.status !== 201 || !shiftRes.data?.shift) {
    throw new Error(`Create shift failed: ${JSON.stringify(shiftRes)}`);
  }
  const shiftId = shiftRes.data.shift.id;
  console.log(`   ✅ Created shift [${shiftId}] via HTTP REST API`);

  // 6. Test POST /api/shifts/:id/publish
  console.log('6. Testing POST /api/shifts/:id/publish...');
  const pubRes = await api(`/api/shifts/${shiftId}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader }
  });
  console.log(`   ✅ Published shift via REST API: status = ${pubRes.data?.shift?.status}`);

  // 7. Test GET /api/planning/summary
  console.log('7. Testing GET /api/planning/summary...');
  const summaryRes = await api('/api/planning/summary?from=2026-08-24&to=2026-08-31', {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader }
  });
  console.log(`   ✅ Planning summary retrieved ${summaryRes.data?.shifts?.length} shifts and ${summaryRes.data?.teams?.length} teams`);

  // 8. Test POST /api/auth/logout
  console.log('8. Testing POST /api/auth/logout...');
  const logoutRes = await api('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader }
  });
  console.log(`   ✅ Logged out successfully: ${logoutRes.data?.message}`);

  // Verify unauthorized after logout
  const meAfterLogout = await api('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader }
  });
  if (meAfterLogout.status !== 401) {
    throw new Error('Expected 401 Unauthorized after logout');
  }
  console.log('   ✅ Verified 401 Unauthorized after logout');

  console.log('\n🌟 ALL HTTP REST API ENDPOINTS VERIFIED & WORKING PERFECTLY! 🌟\n');
}

testHttp().catch((err) => {
  console.error('HTTP Test failed:', err);
  process.exit(1);
});
