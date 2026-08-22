import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    store.bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
