// CivicPulse AI - Express Application Setup
// Configures middleware, CORS, routes, and error handling.

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { complaintsRouter } from './routes/complaints.js';
import { aiRouter } from './routes/ai.js';
import { adminRouter } from './routes/admin.js';
import { communityRouter } from './routes/community.js';
import { contractorRouter } from './routes/contractor.js';
import { emergencyRouter } from './routes/emergency.js';
import { infrastructureRouter } from './routes/infrastructure.js';
import { usersRouter } from './routes/users.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { isFirebaseInitialized } from './config/firebase.js';

dotenv.config();

export const createApp = (): Express => {
  const app = express();

  // ─── CORS Configuration ────────────────────────────────────────────────────
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ─── Body Parsers ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── Health Check ──────────────────────────────────────────────────────────
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        service: 'CivicPulse AI Server',
        city: 'Visakhapatnam (GVMC)',
        version: '1.0.0',
        firebase: isFirebaseInitialized() ? 'connected' : 'demo_mode',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`
      }
    });
  });

  // ─── REST API Routes ───────────────────────────────────────────────────────
  app.use('/api/complaints', complaintsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/community', communityRouter);
  app.use('/api/contractor', contractorRouter);
  app.use('/api/emergency', emergencyRouter);
  app.use('/api/assets', infrastructureRouter);
  app.use('/api/users', usersRouter);

  // ─── Error Handling ────────────────────────────────────────────────────────
  // 404 handler for undefined routes (must be after all route registrations)
  app.use(notFoundHandler);

  // Global error handler (must be the last middleware)
  app.use(errorHandler);

  return app;
};
