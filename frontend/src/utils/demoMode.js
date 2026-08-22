// Single source of truth for dev-only demo behavior — shared by
// ProtectedRoute (auth bypass) and the service layer (mock-data fallback)
// so both turn on/off together with one flag. `import.meta.env.DEV` is
// statically `false` in a production build, so Vite dead-code-eliminates
// every branch guarded by this constant from prod output.
export const isDemoMode = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true';
