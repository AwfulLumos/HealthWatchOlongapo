import { Request, Response, NextFunction } from 'express';
import { ApiError, ValidationError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { config } from '../config/index.js';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error('Error:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(e.message);
    });
    return sendError(res, 'Validation failed', 422, errors);
  }

  // Handle ValidationError
  if (err instanceof ValidationError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Handle ApiError
  if (err instanceof ApiError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return sendError(res, 'A record with this value already exists', 409);
      case 'P2025':
        return sendError(res, 'Record not found', 404);
      case 'P2003':
        return sendError(res, 'Foreign key constraint failed', 400);
      default:
        return sendError(res, 'Database error', 500);
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return sendError(res, 'Invalid data provided', 400);
  }

  // Default error
  const message = config.isDev ? err.message : 'Internal server error';
  return sendError(res, message, 500);
}

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  return sendError(res, `Route ${req.method} ${req.path} not found`, 404);
}
