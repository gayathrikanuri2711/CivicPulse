// CivicPulse AI - Centralized Error Handler Middleware

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Global error-handling middleware.
 * Must be registered AFTER all routes.
 * Catches AppError subclasses and unexpected errors.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  console.error(`[Error] ${err.message}`, err.stack ? `\n${err.stack}` : '');

  if (err instanceof AppError) {
    sendError(
      res,
      err.message,
      err.statusCode,
      err.constructor.name,
      (err as AppError & { fields?: Record<string, string> }).fields
    );
    return;
  }

  // Unexpected / programming errors
  const statusCode = (err as Error & { statusCode?: number }).statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : err.message || 'Internal Server Error';

  sendError(res, message, statusCode, 'INTERNAL_ERROR');
};

/**
 * 404 handler for undefined routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
};

