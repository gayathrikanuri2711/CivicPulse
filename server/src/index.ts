// CivicPulse AI - Server Entry Point
// Initializes Firebase and starts the Express server.

import { initializeFirebase, isFirebaseInitialized } from './config/firebase.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 5000;

const start = async (): Promise<void> => {
  // Initialize Firebase Admin SDK
  await initializeFirebase();

  // Create and start Express app
  const app = createApp();

  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║         CivicPulse AI Server — Phase 1              ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  URL:      http://localhost:${PORT}                    ║`);
    console.log(`║  Health:   http://localhost:${PORT}/api/health          ║`);
    console.log(`║  Firebase: ${isFirebaseInitialized() ? 'Connected ✓' : 'Demo Mode (no credentials)'}        ║`);
    console.log('║  City:     Visakhapatnam (GVMC) Wards 1-98          ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log('[Routes] /api/health          — Server health check');
    console.log('[Routes] /api/complaints      — Complaint management');
    console.log('[Routes] /api/ai              — AI analysis endpoints');
    console.log('[Routes] /api/admin           — Admin dashboard');
    console.log('[Routes] /api/community       — Community proposals');
    console.log('[Routes] /api/contractor      — Contractor work orders');
    console.log('[Routes] /api/emergency       — Emergency alerts');
    console.log('[Routes] /api/assets          — Infrastructure registry');
    console.log('[Routes] /api/users           — User profiles');
    console.log('');
  });
};

start().catch((err) => {
  console.error('[Fatal] Failed to start CivicPulse AI Server:', err);
  process.exit(1);
});
