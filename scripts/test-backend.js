import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { pool } from '../src/lib/server/db/index.js';
import { hashPassword, verifyPassword } from '../src/lib/server/auth/password.js';
import { createSession, validateSession, deleteSession } from '../src/lib/server/auth/session.js';
import { createUserWithOrganization, getUserByEmail } from '../src/lib/server/repositories/userRepository.js';
import { listTeams, createTeam, listTeamMembers, createTeamMember } from '../src/lib/server/repositories/teamRepository.js';
import { listShifts, createShift, rescheduleShift, setShiftPublishState } from '../src/lib/server/repositories/shiftRepository.js';
import { listEvents, createEvent, deleteEvent } from '../src/lib/server/repositories/eventRepository.js';

async function testBackend() {
  console.log('--- Starting Proxie Backend Integration Test (PostgreSQL 18) ---');

  const testEmail = `test.user.${Date.now()}@proxie.local`;
  const testPassword = 'Password123!';

  // 1. Test Password Hashing
  console.log('1. Testing Password Hashing...');
  const hash = await hashPassword(testPassword);
  const isMatch = await verifyPassword(testPassword, hash);
  const isMismatch = await verifyPassword('WrongPassword', hash);
  if (!isMatch || isMismatch) {
    throw new Error('Password hashing verification failed');
  }
  console.log('   ✅ Password hashing & verification passed');

  // 2. Test User & Organization Creation
  console.log('2. Testing User & Organization Creation...');
  const { user, organization } = await createUserWithOrganization(
    {
      email: testEmail,
      passwordHash: hash,
      fullName: 'Test Planner',
      role: 'manager'
    },
    'Acme Corp'
  );
  console.log(`   ✅ Created User [${user.id}] and Organization [${organization.id}]`);

  // Verify fetch user by email
  const fetchedUser = await getUserByEmail(testEmail);
  if (!fetchedUser || fetchedUser.id !== user.id) {
    throw new Error('Could not fetch user by email');
  }
  console.log('   ✅ Fetched user from PostgreSQL 18 by email');

  // 3. Test Session Creation & Validation
  console.log('3. Testing Session Management...');
  const { sessionId } = await createSession(user.id);
  const sessionUser = await validateSession(sessionId);
  if (!sessionUser || sessionUser.id !== user.id || sessionUser.organizationId !== organization.id) {
    throw new Error('Session validation failed');
  }
  console.log(`   ✅ Session validated for user [${sessionUser.fullName}] in org [${sessionUser.organizationName}]`);

  // 4. Test Teams & Members
  console.log('4. Testing Teams & Team Members...');
  const teams = await listTeams(organization.id);
  console.log(`   ✅ Found ${teams.length} initial team(s) (including default 'Algemeen')`);

  const customTeam = await createTeam(organization.id, 'Kitchen Staff', 'Kitchen & Cooking', '#FF9900');
  console.log(`   ✅ Created team '${customTeam.name}' [${customTeam.id}]`);

  const newMember = await createTeamMember(organization.id, customTeam.id, 'Alice Chef', 'alice@chef.local');
  console.log(`   ✅ Created member '${newMember.display_name}' [${newMember.id}]`);

  const members = await listTeamMembers(organization.id);
  console.log(`   ✅ Total team members in org: ${members.length}`);

  // 5. Test Shifts & Rescheduling
  console.log('5. Testing Shifts...');
  const shift = await createShift(organization.id, {
    teamId: customTeam.id,
    teamMemberId: newMember.id,
    shiftDate: '2026-08-30',
    startTime: '09:00',
    endTime: '17:00',
    breakMinutes: 30,
    shiftType: 'Standard',
    note: 'First day shift',
    createdBy: user.id
  });
  console.log(`   ✅ Created shift [${shift.id}] on ${shift.shift_date} from ${shift.start_time} to ${shift.end_time}`);

  // Reschedule
  const rescheduled = await rescheduleShift(
    organization.id,
    shift.id,
    '2026-08-31',
    '10:00',
    '18:00'
  );
  console.log(`   ✅ Rescheduled shift to ${rescheduled.shift_date} (${rescheduled.start_time} - ${rescheduled.end_time})`);

  // Publish
  const published = await setShiftPublishState(organization.id, shift.id, true);
  console.log(`   ✅ Published shift status: ${published.status}`);

  const shiftsList = await listShifts(organization.id);
  console.log(`   ✅ Total shifts retrieved: ${shiftsList.length}`);

  // 6. Test Events
  console.log('6. Testing Events...');
  const eventItem = await createEvent(organization.id, {
    title: 'Weekly Standup',
    eventDate: '2026-08-30',
    startTime: '09:00',
    endTime: '09:30',
    description: 'Weekly team kick-off',
    createdBy: user.id
  });
  console.log(`   ✅ Created event '${eventItem.title}' [${eventItem.id}]`);

  const events = await listEvents(organization.id);
  console.log(`   ✅ Total events retrieved: ${events.length}`);

  // 7. Test Session Deletion
  console.log('7. Testing Session Deletion (Logout)...');
  await deleteSession(sessionId);
  const invalidSession = await validateSession(sessionId);
  if (invalidSession !== null) {
    throw new Error('Session should be invalid after deletion');
  }
  console.log('   ✅ Session successfully deleted');

  console.log('\n🎉 ALL BACKEND & DATABASE INTEGRATION TESTS PASSED! 🎉');
}

testBackend()
  .then(() => pool.end())
  .catch((err) => {
    console.error('❌ Test failed:', err);
    pool.end();
    process.exit(1);
  });
