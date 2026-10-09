"use client";

import React, { useState } from 'react';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { sfx } from '@/lib/sfx';

interface ClanIntelProps {
  recipient: UserProfile | null;
}

const getAvatarImage = (avatarId?: string) => {
  if (!avatarId) return '/avatars/barbarian.png';
  if (avatarId.startsWith('/') || avatarId.startsWith('data:') || avatarId.startsWith('http')) return avatarId;
  const lower = avatarId.toLowerCase();
  if (lower.includes('archer')) return '/avatars/archer.png';
  if (lower.includes('pekka')) return '/avatars/pekka.png';
  if (lower.includes('armored')) return '/avatars/armored.png';
  if (lower.includes('sorcerer') || lower.includes('wizard')) return '/avatars/sorcerer.png';
  if (lower.includes('golem')) return '/avatars/golem.png';
  if (lower.includes('champion') || lower.includes('king')) return '/avatars/champion.png';
  if (lower.includes('town')) return '/avatars/townhall.png';
  return '/avatars/barbarian.png';
};

const getBannerImage = (bannerId?: string, bannerUrl?: string) => {
  if (bannerUrl) return bannerUrl;
  if (!bannerId) return '/banners/legendary-league.png';
  if (bannerId.startsWith('/') || bannerId.startsWith('data:') || bannerId.startsWith('http')) return bannerId;
  const map: Record<string, string> = {
    'arena': '/banners/legendary-league.png',
    'war': '/banners/war-battlefield.png',
    'crimson-fire': '/banners/war-battlefield.png',
    'royal-dragon': '/banners/epic-kingdom.png',
    'emerald-axes': '/banners/dark-fortress.png',
    'golden-lion': '/banners/imposing-citadel.png',
    'village': '/banners/daytime-village.png',
    'dark-fortress': '/banners/dark-fortress.png',
    'epic-kingdom': '/banners/epic-kingdom.png',
    'citadel': '/banners/imposing-citadel.png',
    'serene': '/banners/serene-village.png',
    'dramatic': '/banners/dramatic-warfront.png',
  };
  return map[bannerId] || '/banners/legendary-league.png';
};

const BANNER_FILTERS: Record<string, string> = {
  none: 'none',
  dark: 'contrast(125%) brightness(70%)',
  golden: 'sepia(35%) saturate(160%) hue-rotate(-15deg)',
  dramatic: 'contrast(140%) saturate(140%)',
  sepia: 'sepia(70%) contrast(110%)',
  blur: 'blur(3px) brightness(90%)',
};

export const ClanIntel: React.FC<ClanIntelProps> = ({ recipient }) => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [copiedToast, setCopiedToast] = useState(false);

  const targetUser = recipient || user;

  if (!targetUser) {
    return (
      <aside className="w-full lg:w-[310px] xl:w-[330px] flex-shrink-0 flex flex-col gap-3 h-full overflow-y-auto">
        <div className="bg-[#FFFDF9] border-2 border-[#895333] p-4 rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] text-center text-[#6E4C38] font-body-sm font-bold">
          Select a warrior from the roster to inspect tactical clan intelligence.
        </div>
      </aside>
    );
  }

  const isOnline = targetUser._id ? onlineUsers.includes(targetUser._id) || targetUser.isOnline : true;

  const avatarSrc = getAvatarImage(targetUser.avatar);
  const bannerSrc = getBannerImage(targetUser.bannerPattern, targetUser.bannerUrl);
  const filterStyle = BANNER_FILTERS[targetUser.bannerFilter || 'none'] || 'none';

  const copyTag = () => {
    sfx.playClick();
    navigator.clipboard.writeText('#9YQQ88V');
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  return (
    <aside className="w-full lg:w-[310px] xl:w-[330px] flex-shrink-0 flex flex-col gap-4 h-full overflow-y-auto pr-1">
      
      {/* USER PROFILE CARD (EXACT REPLICA OF IMAGE 1) */}
      <div className="w-full bg-[#FFFDF9] rounded-3xl shadow-[0_16px_40px_rgba(89,53,28,0.25)] overflow-hidden flex flex-col border-4 border-[#C89437] relative">
        
        {/* Banner Area (4:1 Aspect Ratio Top Header) */}
        <div className="relative w-full h-36 sm:h-44 bg-[#EFE0CE] overflow-hidden">
          <img
            src={bannerSrc}
            alt="Warrior Banner"
            style={{ filter: filterStyle }}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"></div>

          {/* Close Icon Button */}
          <button
            type="button"
            onClick={() => sfx.playClick()}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer shadow-md z-20 transition-all"
          >
            <span className="material-symbols-outlined text-base font-bold">close</span>
          </button>

          {/* Banner Title Badge if present */}
          {targetUser.bannerTitle && (
            <div className="absolute bottom-2 left-3 right-3 z-10 flex items-center pointer-events-none">
              <div className="px-2.5 py-1 rounded-xl bg-[#2B180D]/85 backdrop-blur-xs border border-[#C89437] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#FBD46E] text-xs font-black">shield</span>
                <span className="font-headline-sm text-[10px] text-[#FBD46E] uppercase font-black tracking-wider truncate">
                  {targetUser.bannerTitle}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Overlapping Circular Avatar Deck */}
        <div className="px-5 pb-6 -mt-14 flex flex-col items-center text-center bg-[#FFFDF9] relative z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#FAF3E8] shadow-[0_8px_20px_rgba(89,53,28,0.3)] border-4 border-[#FFFDF9] ring-4 ring-[#C89437] relative z-10 flex-shrink-0">
            <img
              src={avatarSrc}
              alt={targetUser.username || 'Warrior Avatar'}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Warrior Name & Verified Tag */}
          <div className="mt-2.5 flex items-center gap-1.5 justify-center">
            <h3 className="font-headline-sm text-xl sm:text-2xl text-[#3E2415] font-black tracking-wide">
              {targetUser.username || 'Sheru'}
            </h3>
            <span className="w-5 h-5 rounded-full bg-[#895333] text-white flex items-center justify-center text-xs shadow-xs flex-shrink-0">
              <span className="material-symbols-outlined text-xs font-bold">check</span>
            </span>
          </div>

          {/* Handle & Player Tag */}
          <span className="font-label-sm text-xs text-[#895333] font-extrabold uppercase mt-0.5 tracking-wider">
            @{targetUser.username || 'Sheru'} • #9YQQ88V
          </span>

          {/* War Motto Quote */}
          <p className="mt-2.5 font-body-sm text-xs sm:text-sm text-[#6E4C38] italic font-bold px-2 leading-relaxed">
            “{targetUser.description || 'Fearless Clash warrior ready for battle.'}”
          </p>

          {/* Stats Grid Box */}
          <div className="w-full grid grid-cols-3 gap-2 mt-4 p-3 rounded-2xl bg-[#FAF5ED] border border-[#E7D6C3] shadow-inner text-center">
            <div className="flex flex-col items-center justify-center">
              <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-black tracking-wider">
                RANK
              </span>
              <span className="font-headline-sm text-xs sm:text-sm text-[#24140D] font-black uppercase mt-0.5 truncate max-w-full">
                {targetUser.role || 'WARRIOR'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center border-x border-[#E7D6C3] px-1">
              <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-black tracking-wider">
                TROPHIES
              </span>
              <span className="font-headline-sm text-xs sm:text-sm text-[#895333] font-black mt-0.5">
                {targetUser.trophies || 2450} ★
              </span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-black tracking-wider">
                CLAN
              </span>
              <span className="font-headline-sm text-xs sm:text-sm text-[#673C21] font-black mt-0.5 truncate max-w-full">
                {targetUser.clan?.name || 'Valhalla'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => sfx.playClick()}
              className="py-2.5 rounded-2xl bg-[#E8DAC9] hover:bg-[#DCC8B0] border border-[#CBAF90] text-[#553013] font-headline-sm text-xs font-black uppercase transition-all cursor-pointer shadow-xs active:translate-y-0.5"
            >
              CLOSE
            </button>

            <button
              type="button"
              onClick={copyTag}
              className="py-2.5 rounded-2xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] text-[#412708] border-b-2 border-[#A8740B] font-headline-sm text-xs font-black uppercase shadow-sm active:translate-y-0.5 hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <span>{copiedToast ? 'COPIED!' : 'COPY TAG'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* CLAN INTEL & ROSTER LIST BELOW PROFILE CARD */}
      <div className="bg-[#FFFDF9] border-2 border-[#895333] p-3.5 rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] flex flex-col gap-3">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm text-[#3E2415] uppercase tracking-wider font-extrabold">
            CLAN INTEL
          </span>
          <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#FCE58D] border border-[#DEB03A] text-[#633C08] uppercase font-black">
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        {/* War Preparedness Gauge */}
        <div className="p-2.5 bg-[#FAF3E8] border border-[#DFCAAE] rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-12 h-12 relative flex-shrink-0 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#E7D6C3]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-[#C88421]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="84, 100"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
            <span className="absolute font-label-md text-xs text-[#663A0F] font-black">84%</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-xs text-[#24140D] font-black">Siege Deck Ready</span>
            <span className="font-body-sm text-[11px] text-[#775239]">21/25 defense bases verified</span>
          </div>
        </div>

        {/* Roster Status */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs text-[#694228] uppercase tracking-wider font-extrabold">
              ROSTER STATUS
            </span>
            <span className="font-label-sm text-[10px] text-[#9A5A1B] uppercase font-black cursor-pointer hover:underline">
              SEE ALL
            </span>
          </div>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#FFFFFF] border border-[#E7D7C6] hover:bg-[#FFFBF5] transition-colors shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
                <span className="font-label-md text-xs text-[#24140D] font-bold">Ahmed</span>
                <span className="font-label-sm text-[10px] text-[#895333] uppercase font-black">Co-Leader</span>
              </div>
              <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-[#F8E3C2] text-[#693E1B] font-bold border border-[#DEC095]">
                LVL 64
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#FFFFFF] border border-[#E7D7C6] hover:bg-[#FFFBF5] transition-colors shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
                <span className="font-label-md text-xs text-[#24140D] font-bold">Sara</span>
                <span className="font-label-sm text-[10px] text-[#7A4B1A] uppercase font-bold">Elder</span>
              </div>
              <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-[#F8E3C2] text-[#693E1B] font-bold border border-[#DEC095]">
                LVL 58
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-1.5 pt-1">
          <button
            type="button"
            onClick={logout}
            className="w-full py-2 px-3 rounded-xl bg-[#FEECEC] hover:bg-[#FCD8D8] border border-[#F3BABA] text-[#B71C1C] font-label-sm text-xs uppercase tracking-wider flex items-center justify-between transition-colors font-black cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">logout</span>
              RETREAT FROM CLAN
            </span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

      </div>

    </aside>
  );
};
