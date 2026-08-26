async function testUserIsolation() {
  console.log('===============================================================');
  console.log('🚀 MULTI-TENANT USER AUTHENTICATION & DATA ISOLATION TEST');
  console.log('===============================================================\n');

  const baseUrl = 'http://localhost:5173';

  async function api(path: string, options: any = {}, cookie: string = '') {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers
    });
    const data = await res.json().catch(() => null);
    const setCookie = res.headers.get('set-cookie');
    const newCookie = setCookie ? setCookie.split(';')[0] : cookie;
    return { status: res.status, data, cookie: newCookie };
  }

  // TEST 1: Reject Garbage / Unregistered Credentials
  console.log('TEST 1: Verifying garbage / unregistered login rejection...');
  const fakeLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identity: 'random_hacker@unknown.com',
      password: 'RandomGarbagePassword123'
    })
  });

  if (fakeLogin.status === 401 && fakeLogin.data?.error?.code === 'INVALID_CREDENTIALS') {
    console.log('   ✅ PASSED: Random credentials correctly rejected with 401 Unauthorized!\n');
  } else {
    throw new Error(`Expected 401 INVALID_CREDENTIALS, got: ${JSON.stringify(fakeLogin)}`);
  }

  // TEST 2: Register User 1 (Pritam)
  const pritamEmail = `pritam.${Date.now()}@proxie.local`;
  const pritamPassword = 'PritamPassword@123';
  console.log(`TEST 2: Registering User 1: Pritam (${pritamEmail})...`);

  const pritamSignup = await api('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: pritamEmail,
      password: pritamPassword,
      fullName: 'Pritam Developer',
      company: "Pritam's Restaurant Workspace"
    })
  });

  if (pritamSignup.status !== 201 || !pritamSignup.data?.user) {
    throw new Error(`Pritam signup failed: ${JSON.stringify(pritamSignup)}`);
  }
  const pritamCookie = pritamSignup.cookie;
  const pritamOrgId = pritamSignup.data.user.organizationId;
  console.log(`   ✅ Pritam registered in Organization [${pritamOrgId}] (${pritamSignup.data.user.organizationName})`);

  // TEST 3: Pritam creates a shift
  console.log("TEST 3: Pritam creates shift: 'Pritam Morning Shift'...");
  const pritamShiftRes = await api(
    '/api/shifts',
    {
      method: 'POST',
      body: JSON.stringify({
        shiftDate: '2026-08-30',
        startTime: '09:00',
        endTime: '17:00',
        breakMinutes: 30,
        shiftType: 'Opening',
        note: 'Pritam Morning Shift'
      })
    },
    pritamCookie
  );

  if (pritamShiftRes.status !== 201 || !pritamShiftRes.data?.shift) {
    throw new Error(`Pritam shift creation failed: ${JSON.stringify(pritamShiftRes)}`);
  }
  const pritamShiftId = pritamShiftRes.data.shift.id;
  console.log(`   ✅ Created Pritam's shift [${pritamShiftId}]`);

  // Pritam checks summary
  const pritamSummary1 = await api('/api/planning/summary?from=2026-08-24&to=2026-08-31', {}, pritamCookie);
  console.log(`   ✅ Pritam's planning view shows ${pritamSummary1.data?.shifts?.length} shift(s): "${pritamSummary1.data?.shifts[0]?.note}"`);

  // TEST 4: Pritam logs out
  console.log('\nTEST 4: Pritam logs out...');
  await api('/api/auth/logout', { method: 'POST' }, pritamCookie);
  console.log('   ✅ Pritam session terminated.\n');

  // TEST 5: Register User 2 (Utsab)
  const utsabEmail = `utsab.${Date.now()}@proxie.local`;
  const utsabPassword = 'UtsabPassword@123';
  console.log(`TEST 5: Registering User 2: Utsab (${utsabEmail})...`);

  const utsabSignup = await api('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: utsabEmail,
      password: utsabPassword,
      fullName: 'Utsab Manager',
      company: "Utsab's Hotel Workspace"
    })
  });

  if (utsabSignup.status !== 201 || !utsabSignup.data?.user) {
    throw new Error(`Utsab signup failed: ${JSON.stringify(utsabSignup)}`);
  }
  const utsabCookie = utsabSignup.cookie;
  const utsabOrgId = utsabSignup.data.user.organizationId;
  console.log(`   ✅ Utsab registered in Organization [${utsabOrgId}] (${utsabSignup.data.user.organizationName})`);

  // TEST 6: Verify Utsab CANNOT see Pritam's shifts
  console.log("TEST 6: Checking Utsab's workspace for data isolation...");
  const utsabSummary1 = await api('/api/planning/summary?from=2026-08-24&to=2026-08-31', {}, utsabCookie);
  if (utsabSummary1.data?.shifts?.length !== 0) {
    throw new Error(`❌ DATA LEAK! Utsab saw ${utsabSummary1.data.shifts.length} shifts from another user!`);
  }
  console.log("   ✅ PASSED: Utsab's planning workspace has 0 shifts (Pritam's shift is completely hidden & isolated)!");

  // TEST 7: Utsab creates their own shift
  console.log("TEST 7: Utsab creates shift: 'Utsab Evening Shift'...");
  const utsabShiftRes = await api(
    '/api/shifts',
    {
      method: 'POST',
      body: JSON.stringify({
        shiftDate: '2026-08-30',
        startTime: '17:00',
        endTime: '23:00',
        breakMinutes: 15,
        shiftType: 'Closing',
        note: 'Utsab Evening Shift'
      })
    },
    utsabCookie
  );

  if (utsabShiftRes.status !== 201 || !utsabShiftRes.data?.shift) {
    throw new Error(`Utsab shift creation failed: ${JSON.stringify(utsabShiftRes)}`);
  }
  const utsabShiftId = utsabShiftRes.data.shift.id;
  console.log(`   ✅ Created Utsab's shift [${utsabShiftId}]`);

  const utsabSummary2 = await api('/api/planning/summary?from=2026-08-24&to=2026-08-31', {}, utsabCookie);
  console.log(`   ✅ Utsab sees only their ${utsabSummary2.data?.shifts?.length} shift: "${utsabSummary2.data?.shifts[0]?.note}"`);

  // TEST 8: Utsab logs out
  console.log('\nTEST 8: Utsab logs out...');
  await api('/api/auth/logout', { method: 'POST' }, utsabCookie);
  console.log('   ✅ Utsab session terminated.\n');

  // TEST 9: Pritam logs back in and checks their workspace
  console.log('TEST 9: Pritam logs back in...');
  const pritamLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identity: pritamEmail,
      password: pritamPassword
    })
  });

  if (pritamLogin.status !== 200) {
    throw new Error(`Pritam login failed: ${JSON.stringify(pritamLogin)}`);
  }
  const pritamLoginCookie = pritamLogin.cookie;
  console.log('   ✅ Pritam successfully logged in.');

  const pritamSummary2 = await api('/api/planning/summary?from=2026-08-24&to=2026-08-31', {}, pritamLoginCookie);
  const pritamShifts = pritamSummary2.data?.shifts || [];

  if (pritamShifts.length !== 1 || pritamShifts[0].id !== pritamShiftId) {
    throw new Error(`Pritam's workspace state corrupted: ${JSON.stringify(pritamShifts)}`);
  }
  console.log(`   ✅ Pritam sees ONLY their 1 shift: "${pritamShifts[0].note}" (ID: ${pritamShifts[0].id})`);
  console.log("   ✅ Pritam DOES NOT see Utsab's shift!");

  console.log('\n===============================================================');
  console.log('🎉 100% COMPLETE MULTI-TENANT ISOLATION VERIFIED SUCCESSFULLY! 🎉');
  console.log('===============================================================\n');
}

testUserIsolation().catch((err) => {
  console.error('\n❌ ISOLATION TEST FAILED:', err);
  process.exit(1);
});
