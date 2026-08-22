// Wraps an async Express handler so a rejected promise is forwarded to
// next(err) instead of crashing the process or hanging the request.
export function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
