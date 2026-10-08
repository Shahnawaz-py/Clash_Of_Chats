"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClansPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/chats');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F6EFE6] flex items-center justify-center p-6 text-[#895333] font-headline-sm animate-pulse">
      Redirecting to War Room...
    </div>
  );
}
