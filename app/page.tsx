"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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

  return (
    <div className="min-h-screen bg-[#180b06] flex items-center justify-center text-primary">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <img src="/images/coc-logo.png" alt="Clash of Chats Logo" className="w-16 h-16 object-contain drop-shadow-lg" />
        <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-sm text-tertiary font-bold">
          ENTERING CLASH OF CHATS...
        </span>
      </div>
    </div>
  );
}