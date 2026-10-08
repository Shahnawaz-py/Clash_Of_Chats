"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { sfx } from '@/lib/sfx';
import { WarHornModal } from '@/components/WarHornModal';
import { ClansListModal } from '@/components/ClansListModal';
import { UserSettingsModal } from '@/components/UserSettingsModal';

export const NavigationHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { isPlaying, toggleMusic } = useAudio();
  const pathname = usePathname();

  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isWarHornOpen, setIsWarHornOpen] = useState(false);
  const [isClansOpen, setIsClansOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    sfx.playLogout();
    logout();
  };

  const activeClass = "font-label-md px-4 py-2 uppercase tracking-wider transition-all bg-gradient-to-b from-[#FCD66D] to-[#E5A323] text-[#3E2207] font-black rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] border-b-2 border-[#9F650A]";
  const inactiveClass = "font-label-md text-label-md px-4 py-2 uppercase tracking-wider text-[#E8CDB2] hover:text-[#FFFFFF] hover:bg-[#482816] rounded-lg transition-all cursor-pointer font-bold";

  const isChatsActive = (pathname === '/chats' || pathname === '/') && activeTab === null;
  const isClansActive = activeTab === 'clans' || isClansOpen;
  const isWarHornActive = activeTab === 'warhorn' || isWarHornOpen;
  const isCallToArmsActive = activeTab === 'calltoarms';

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#3C2314] border-b-4 border-[#C89437] shadow-[0_6px_18px_rgba(40,20,10,0.35)]">
      <div className="h-20 w-full px-4 lg:px-8 flex items-center justify-between">

        {/* Left Branding */}
        <Link href="/" onClick={() => { sfx.playClick(); setActiveTab(null); }} className="flex items-center gap-3 group">
          <div className="h-12 w-12 flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform">
            <img src="/images/coc-logo.png" alt="Clash of Chats Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-[#FBD46E] uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              CLASH
            </span>
            <span className="font-label-sm text-label-sm text-[#E2C5A5] uppercase tracking-widest font-extrabold">
              Clash of Chats
            </span>
          </div>
        </Link>

        {/* Center Nav Pills - Positioned in the Middle */}
        <nav className="hidden xl:flex items-center justify-center gap-1.5 bg-[#2B180D] p-1.5 rounded-xl border border-[#5A3822] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] mx-auto">
          <Link
            href="/chats"
            onClick={() => { sfx.playClick(); setActiveTab(null); }}
            className={isChatsActive ? activeClass : inactiveClass}
          >
            War Room Chat
          </Link>
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveTab('clans');
              setIsClansOpen(true);
            }}
            className={isClansActive ? activeClass : inactiveClass}
          >
            Clans
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.playWarHorn();
              setActiveTab('warhorn');
              setIsWarHornOpen(true);
            }}
            className={isWarHornActive ? activeClass : inactiveClass}
          >
            War Horn
          </button>
          <button
            type="button"
            onClick={() => { sfx.playClick(); setActiveTab('calltoarms'); }}
            className={isCallToArmsActive ? activeClass : inactiveClass}
          >
            Call to Arms
          </button>
        </nav>

        {/* Right User & Audio Bar */}
        <div className="flex items-center gap-3">

          {/* Music ON/OFF Volume Toggle Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMusic();
            }}
            aria-label="Toggle Music & SFX"
            title={isPlaying ? "Mute Background Music & SFX" : "Play Background Music & SFX"}
            className="w-10 h-10 rounded-xl bg-[#53301B] border-2 border-[#7A4B2E] hover:border-[#C89437] flex items-center justify-center hover:bg-[#683C22] shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-all cursor-pointer"
          >
            <span className={`material-symbols-outlined text-lg ${isPlaying ? 'text-[#FBD46E]' : 'text-[#8A6348]'}`}>
              {isPlaying ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* User Profile & Dropdown */}
          <div className="relative pl-1">
            <button
              onClick={() => {
                sfx.playClick();
                setShowDropdown(!showDropdown);
              }}
              className="flex items-center gap-2.5 focus:outline-none cursor-pointer group"
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#53301B] flex items-center justify-center text-[#FBD46E] border-2 border-[#C89437] shadow-[0_2px_6px_rgba(0,0,0,0.4)] overflow-hidden">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#E53935] ring-2 ring-[#3C2314]"
                  title="Active in Barracks"
                />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="font-label-md text-label-md text-[#FFF3E3] leading-tight font-bold group-hover:text-[#FBD46E] transition-colors">
                  {user?.username || 'Chieftain'}
                </span>
                <span className="font-label-sm text-label-sm text-[#FBD46E] uppercase font-extrabold tracking-wider">
                  {user?.role || 'Clan Leader'}
                </span>
              </div>
              <span className="material-symbols-outlined text-[#E2C5A5] text-base">
                arrow_drop_down
              </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-[#FFFDF9] rounded-xl shadow-2xl border-2 border-[#895333] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-[#E7D6C3] mb-1">
                  <p className="font-label-md text-label-md text-[#3E2415] font-bold">{user?.username}</p>
                  <p className="font-body-sm text-body-sm text-[#6E4C38] truncate">{user?.email}</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => {
                    sfx.playClick();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#553013] hover:bg-[#F5EAD9] font-label-md text-label-md uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer font-black mb-1"
                >
                  <span className="material-symbols-outlined text-base">settings</span>
                  SETTINGS (PROFILE)
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#B71C1C] hover:bg-[#FEECEC] font-label-md text-label-md uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer font-black"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  RETREAT (LOGOUT)
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      <WarHornModal
        isOpen={isWarHornOpen}
        onClose={() => setIsWarHornOpen(false)}
      />

      <ClansListModal
        isOpen={isClansOpen}
        onClose={() => setIsClansOpen(false)}
      />

      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
};
