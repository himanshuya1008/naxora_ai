import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { isDevelopment } from '../config/env.js';

function normalizeError(err) {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    return AppError.badRequest(message, 'VALIDATION_ERROR');
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return AppError.conflict(`A record with this ${err.meta?.target ?? 'value'} already exists`, 'DUPLICATE_RECORD');
    }
    if (err.code === 'P2025') {
      return AppError.notFound('Record not found', 'RECORD_NOT_FOUND');
    }
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return AppError.unauthorized('Invalid or expired session, please log in again', 'INVALID_TOKEN');
  }

  return AppError.internal(isDevelopment ? err.message : 'Something went wrong', 'INTERNAL_ERROR');
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Whether the RAW incoming error was already a deliberately-thrown
  // AppError (bad input, 404, etc.) has to be checked before normalization —
  // normalizeError() wraps everything (Prisma errors, TypeErrors, anything)
  // into a new AppError, whose isOperational is unconditionally true. Using
  // the *normalized* error's isOperational here always evaluated to true, so
  // `stack` was never once included in a response, in any environment: a
  // genuine unexpected exception in dev mode showed only the bare message,
  // never the file/line info needed to actually debug it.
  const wasUnexpected = !(err instanceof AppError);
  const error = normalizeError(err);

  if (!error.isOperational || error.statusCode >= 500) {
    logger.error({ err, path: req.path, method: req.method }, error.message);
  } else {
    logger.warn({ code: error.code, path: req.path, method: req.method }, error.message);
  }

  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(isDevelopment && wasUnexpected ? { stack: err.stack } : {}),
    },
  });
}
