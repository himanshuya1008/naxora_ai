import { useEffect } from 'react';
import { useVisitorAuthStore } from '../store/visitorAuthStore.js';

export function useVisitorAuth() {
  const store = useVisitorAuthStore();

  useEffect(() => {
    store.bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
