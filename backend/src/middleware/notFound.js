import { AppError } from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
}
