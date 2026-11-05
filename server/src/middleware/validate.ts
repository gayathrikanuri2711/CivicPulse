// CivicPulse AI - Request Validation Middleware

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors.js';

/**
 * Generic validation middleware factory.
 * Accepts a validator function that returns an object of field errors
 * (empty object = valid).
 *
 * Usage:
 *   router.post('/users/profile', validate(validateCreateProfile), handler);
 */
export const validate = (
  validatorFn: (body: Record<string, unknown>) => Record<string, string>
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors = validatorFn(req.body || {});
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      return next(new ValidationError(`Validation failed: ${errorKeys.join(', ')}`, errors));
    }

    next();
  };
};

// ─── Built-in Validators ────────────────────────────────────────────────────

/**
 * Validates user profile creation request body.
 */
export const validateCreateProfile = (body: Record<string, unknown>): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!body.name || typeof body.name !== 'string' || (body.name as string).trim().length < 2) {
    errors.name = 'Name is required and must be at least 2 characters';
  }

  if (body.phone && typeof body.phone === 'string') {
    const phone = (body.phone as string).replace(/\s/g, '');
    if (!/^\+91\d{10}$/.test(phone)) {
      errors.phone = 'Phone must be a valid Indian number (+91XXXXXXXXXX)';
    }
  }

  if (body.preferredLanguage && !['en', 'te'].includes(body.preferredLanguage as string)) {
    errors.preferredLanguage = 'Preferred language must be "en" or "te"';
  }

  return errors;
};

/**
 * Validates user profile update request body.
 */
export const validateUpdateProfile = (body: Record<string, unknown>): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || (body.name as string).trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
  }

  if (body.phone !== undefined && typeof body.phone === 'string') {
    const phone = (body.phone as string).replace(/\s/g, '');
    if (phone && !/^\+91\d{10}$/.test(phone)) {
      errors.phone = 'Phone must be a valid Indian number (+91XXXXXXXXXX)';
    }
  }

  if (body.preferredLanguage !== undefined && !['en', 'te'].includes(body.preferredLanguage as string)) {
    errors.preferredLanguage = 'Preferred language must be "en" or "te"';
  }

  // Prevent role escalation through profile updates
  if (body.role !== undefined) {
    errors.role = 'Role cannot be changed through profile updates';
  }

  return errors;
};

