"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CloudLoadingScreen } from '@/components/CloudLoadingScreen';

export const AuthProtected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <CloudLoadingScreen message="VERIFYING WAR SEAL..." />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
