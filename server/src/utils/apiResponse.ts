// CivicPulse AI - Consistent API Response Format

import { Response } from 'express';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string>;
}

/**
 * Send a successful JSON response with consistent structure.
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string,
  meta?: Record<string, unknown>
): void => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta }),
  };
  res.status(statusCode).json(response);
};

/**
 * Send an error JSON response with consistent structure.
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 500,
  code?: string,
  details?: Record<string, string>
): void => {
  const response: ApiErrorResponse = {
    success: false,
    error,
    ...(code && { code }),
    ...(details && { details }),
  };
  res.status(statusCode).json(response);
};

