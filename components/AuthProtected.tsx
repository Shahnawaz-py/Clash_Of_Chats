"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const AuthProtected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface">
        <div className="w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center animate-pulse mb-4 shadow-2xl">
          <span className="material-symbols-outlined text-primary text-3xl">shield</span>
        </div>
        <p className="font-headline-sm text-headline-sm text-primary tracking-wider uppercase">
          Verifying War Seal...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
