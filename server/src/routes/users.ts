// CivicPulse AI - User Profile Routes
// GET /api/users/me, POST /api/users/profile, PUT /api/users/profile, GET /api/users

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate, validateCreateProfile, validateUpdateProfile } from '../middleware/validate.js';
import { getProfile, createProfile, updateProfile, listUsers } from '../controllers/userController.js';

export const usersRouter = Router();

// All user routes require authentication
usersRouter.use(requireAuth);

// Get current user's profile
usersRouter.get('/me', getProfile);

// Create profile (first-time setup)
usersRouter.post('/profile', validate(validateCreateProfile), createProfile);

// Update profile
usersRouter.put('/profile', validate(validateUpdateProfile), updateProfile);

// Admin: list all users
usersRouter.get('/', authorize('admin'), listUsers);

