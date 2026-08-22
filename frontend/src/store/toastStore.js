import { create } from 'zustand';

let nextId = 0;
const AUTO_DISMISS_MS = 4500;

export const useToastStore = create((set) => ({
  toasts: [],

  push(type, message) {
    const id = ++nextId;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, AUTO_DISMISS_MS);
  },

  dismiss(id) {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

// Ergonomic call-site API — `toast.success('...')` — rather than every
// caller reaching into the store directly.
export const toast = {
  success: (message) => useToastStore.getState().push('success', message),
  error: (message) => useToastStore.getState().push('error', message),
  info: (message) => useToastStore.getState().push('info', message),
};
