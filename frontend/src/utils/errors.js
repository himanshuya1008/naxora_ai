// Backend error responses shape as { error: { message } } (see errorHandler.js);
// centralizing the unwrap here means every page reports the actual backend
// message (e.g. "Invalid credentials") instead of a generic fallback.
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.error?.message ?? fallback;
}
