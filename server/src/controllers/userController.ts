// CivicPulse AI - User Controller
// Handles HTTP request/response for user profile operations.

import { Request, Response, NextFunction } from 'express';
import { getUserByUid, createUser, updateUser, getAllUsers } from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

/**
 * GET /api/users/me
 * Returns the authenticated user's profile.
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = req.authUser!.uid;
    const user = await getUserByUid(uid);

    if (!user) {
      // User is authenticated but has no profile yet
      sendSuccess(res, null, 200, 'No profile found. Please create one.');
      return;
    }

    sendSuccess(res, user, 200, 'Profile retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users/profile
 * Creates a user profile for the authenticated user.
 * Role is determined server-side based on admin configuration.
 */
export const createProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = req.authUser!.uid;

    // Check if profile already exists
    const existing = await getUserByUid(uid);
    if (existing) {
      throw new ConflictError('Profile already exists. Use PUT to update.');
    }

    const { name, email, phone, ward, locality, preferredLanguage } = req.body;

    // Role is ALWAYS determined server-side — never trust client input
    // New registrations are always 'citizen' unless pre-configured
    const role = req.authUser!.role || 'citizen';

    const user = await createUser(
      uid,
      { name, email, phone, ward, locality, preferredLanguage },
      role
    );

    sendSuccess(res, user, 201, 'Profile created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/profile
 * Updates the authenticated user's profile.
 * Role changes are NOT allowed through this endpoint.
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = req.authUser!.uid;
    const { name, phone, ward, locality, preferredLanguage } = req.body;

    const updated = await updateUser(uid, { name, phone, ward, locality, preferredLanguage });

    if (!updated) {
      throw new NotFoundError('User profile');
    }

    sendSuccess(res, updated, 200, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users (Admin only)
 * Lists all registered users.
 */
export const listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await getAllUsers();
    sendSuccess(res, users, 200, `Found ${users.length} users`);
  } catch (err) {
    next(err);
  }
};

