'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  return <>{children}</>;
}
