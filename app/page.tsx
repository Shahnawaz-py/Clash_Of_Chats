"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CloudLoadingScreen } from '@/components/CloudLoadingScreen';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/chats');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return <CloudLoadingScreen message="ENTERING CLASH OF CHATS..." />;
}