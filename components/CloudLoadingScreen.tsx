"use client";

import React from 'react';

interface CloudLoadingScreenProps {
  message?: string;
  isFading?: boolean;
}

export const CloudLoadingScreen: React.FC<CloudLoadingScreenProps> = ({
  message = "ENTERING CLASH OF CHATS...",
  isFading = false,
}) => {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fdfdfd] overflow-hidden select-none transition-all duration-700 ease-in-out ${
        isFading
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
    >
      {/* Clash of Clans Cloud Image Background */}
      <img
        src="/images/coc-cloud.png"
        alt="Clash of Chats Loading..."
        className="w-full h-full object-cover object-center absolute inset-0 select-none pointer-events-none"
      />

      {/* Dynamic Loading Message & Progress Indicator */}
      <div className="absolute bottom-12 sm:bottom-16 flex flex-col items-center gap-3 z-10 px-4 text-center">
        <div className="flex items-center gap-3 bg-[#180b06]/80 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-[#895333] shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <div className="w-5 h-5 border-3 border-[#F5C242] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="font-headline-sm text-headline-sm text-[#F5C242] uppercase tracking-wider text-xs sm:text-sm font-black drop-shadow">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};
