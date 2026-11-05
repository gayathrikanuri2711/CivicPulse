// CivicPulse AI - API Test Script using http module
const http = require('http');

const request = (method, path, body, headers) => {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const demoToken = (role) => Buffer.from(JSON.stringify({
  uid: `${role}-demo`, role, email: `${role}@civicpulse.in`
})).toString('base64');

const run = async () => {
  console.log('\n══════ CivicPulse AI — Phase 1 API Tests ══════\n');

  const citizenAuth = { Authorization: `Bearer ${demoToken('citizen')}` };
  const adminAuth = { Authorization: `Bearer ${demoToken('admin')}` };

  // 1. Health
  const h = await request('GET', '/api/health');
  console.log(`${h.status === 200 ? '✓' : '✗'} [${h.status}] GET /api/health — firebase: ${h.data?.data?.firebase}`);

  // 2. User profile - GET
  const me = await request('GET', '/api/users/me', null, citizenAuth);
  console.log(`${me.status === 200 ? '✓' : '✗'} [${me.status}] GET /api/users/me`);

  // 3. User profile - CREATE
  const create = await request('POST', '/api/users/profile', {
    name: 'Test Citizen', phone: '+919848012345', ward: 'Ward 21', preferredLanguage: 'en'
  }, citizenAuth);
  console.log(`${create.status === 201 ? '✓' : '✗'} [${create.status}] POST /api/users/profile`);

  // 4. User profile - UPDATE
  const upd = await request('PUT', '/api/users/profile', {
    name: 'Updated Citizen', preferredLanguage: 'te'
  }, citizenAuth);
  console.log(`${upd.status === 200 ? '✓' : '✗'} [${upd.status}] PUT /api/users/profile`);

  // 5. Validation: short name
  const badCreate = await request('POST', '/api/users/profile', {
    name: 'A', phone: '12345'
  }, { Authorization: `Bearer ${demoToken('citizen').slice(0, -5)}XX==` });
  console.log(`${badCreate.status === 400 || badCreate.status === 409 ? '✓' : '✗'} [${badCreate.status}] Validation test`);

  // 6. Role escalation blocked
  const escalate = await request('PUT', '/api/users/profile', {
    role: 'admin'
  }, citizenAuth);
  console.log(`${escalate.status === 400 ? '✓' : '✗'} [${escalate.status}] Role escalation blocked`);

  // 7. Authorization: citizen can't list all users
  const listCitizen = await request('GET', '/api/users', null, citizenAuth);
  console.log(`${listCitizen.status === 403 ? '✓' : '✗'} [${listCitizen.status}] Citizen can't list users`);

  // 8. Authorization: admin can list users
  const listAdmin = await request('GET', '/api/users', null, adminAuth);
  console.log(`${listAdmin.status === 200 ? '✓' : '✗'} [${listAdmin.status}] Admin can list users (${listAdmin.data?.data?.length} users)`);

  // 9. Existing endpoints
  const complaints = await request('GET', '/api/complaints');
  console.log(`${complaints.status === 200 ? '✓' : '✗'} [${complaints.status}] GET /api/complaints (${Array.isArray(complaints.data) ? complaints.data.length : '?'} items)`);

  const overview = await request('GET', '/api/admin/overview');
  console.log(`${overview.status === 200 ? '✓' : '✗'} [${overview.status}] GET /api/admin/overview`);

  const analytics = await request('GET', '/api/admin/analytics');
  console.log(`${analytics.status === 200 ? '✓' : '✗'} [${analytics.status}] GET /api/admin/analytics`);

  const proposals = await request('GET', '/api/community/proposals');
  console.log(`${proposals.status === 200 ? '✓' : '✗'} [${proposals.status}] GET /api/community/proposals`);

  const alerts = await request('GET', '/api/emergency/alerts');
  console.log(`${alerts.status === 200 ? '✓' : '✗'} [${alerts.status}] GET /api/emergency/alerts`);

  const assets = await request('GET', '/api/assets');
  console.log(`${assets.status === 200 ? '✓' : '✗'} [${assets.status}] GET /api/assets`);

  // 10. 404
  const notFound = await request('GET', '/api/nonexistent');
  console.log(`${notFound.status === 404 ? '✓' : '✗'} [${notFound.status}] 404 handler`);

  console.log('\n══════ Tests Complete ══════\n');
};

run().catch(e => console.error('Test failed:', e.message));
