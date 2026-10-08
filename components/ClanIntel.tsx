"use client";

import React, { useState } from 'react';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { sfx } from '@/lib/sfx';

interface ClanIntelProps {
  recipient: UserProfile | null;
  onDeselectRecipient?: () => void;
}

const getAvatarImage = (avatarId?: string, username?: string) => {
  if (avatarId && (avatarId.startsWith('/') || avatarId.startsWith('data:') || avatarId.startsWith('http'))) {
    return avatarId;
  }
  const avatarKey = (avatarId || username || '').toLowerCase();
  if (avatarKey.includes('archer')) return '/avatars/archer.png';
  if (avatarKey.includes('pekka')) return '/avatars/pekka.png';
  if (avatarKey.includes('armored') || avatarKey.includes('knight')) return '/avatars/armored.png';
  if (avatarKey.includes('sorcerer') || avatarKey.includes('wizard')) return '/avatars/sorcerer.png';
  if (avatarKey.includes('golem') || avatarKey.includes('tinkerer')) return '/avatars/golem.png';
  if (avatarKey.includes('champion') || avatarKey.includes('king')) return '/avatars/champion.png';
  if (avatarKey.includes('town')) return '/avatars/townhall.png';

  if (username) {
    const defaults = [
      '/avatars/barbarian.png',
      '/avatars/archer.png',
      '/avatars/sorcerer.png',
      '/avatars/armored.png',
      '/avatars/pekka.png',
      '/avatars/champion.png',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return defaults[Math.abs(hash) % defaults.length];
  }
  return '/avatars/barbarian.png';
};

const BANNER_MAP: Record<string, string> = {
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

const getBannerImage = (bannerPattern?: string, bannerUrl?: string, username?: string) => {
  if (bannerUrl) return bannerUrl;
  if (bannerPattern && BANNER_MAP[bannerPattern]) return BANNER_MAP[bannerPattern];
  
  if (username) {
    const banners = Object.values(BANNER_MAP);
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return banners[Math.abs(hash) % banners.length];
  }
  return '/banners/legendary-league.png';
};

const BANNER_FILTERS: Record<string, string> = {
  none: 'none',
  dark: 'contrast(125%) brightness(70%)',
  golden: 'sepia(35%) saturate(160%) hue-rotate(-15deg)',
  dramatic: 'contrast(140%) saturate(140%)',
  sepia: 'sepia(70%) contrast(110%)',
  blur: 'blur(3px) brightness(90%)',
};

export const ClanIntel: React.FC<ClanIntelProps> = ({ recipient, onDeselectRecipient }) => {
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

  const isSelf = !recipient || (user && recipient._id === user._id);
  const isOnline = targetUser._id ? onlineUsers.includes(targetUser._id) || targetUser.isOnline : true;

  const avatarSrc = getAvatarImage(targetUser.avatar, targetUser.username);
  const bannerSrc = getBannerImage(targetUser.bannerPattern, targetUser.bannerUrl, targetUser.username);
  const filterStyle = BANNER_FILTERS[targetUser.bannerFilter || 'none'] || 'none';

  const playerTag = targetUser.tag || ('#' + (targetUser._id ? targetUser._id.slice(-6).toUpperCase() : '9YQQ88V'));

  const handleCopyTag = () => {
    sfx.playClick();
    navigator.clipboard.writeText(playerTag);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleCloseCard = () => {
    sfx.playClick();
    if (onDeselectRecipient) {
      onDeselectRecipient();
    }
  };

  const clanName = typeof targetUser.clan === 'object' ? targetUser.clan?.name : (targetUser.clan || 'Valhalla');

  return (
    <aside className="w-full lg:w-[310px] xl:w-[330px] flex-shrink-0 flex flex-col gap-3.5 h-full overflow-y-auto pr-1">
      
      {/* RECIPIENT / USER PROFILE CARD */}
      <div className="w-full bg-[#FFFDF9] rounded-2xl shadow-[0_12px_30px_rgba(89,53,28,0.22)] overflow-hidden flex flex-col border-3 border-[#C89437] relative flex-shrink-0">
        
        {/* Banner Area */}
        <div className="relative w-full h-28 sm:h-32 bg-[#EFE0CE] overflow-hidden">
          <img
            src={bannerSrc}
            alt="Warrior Banner"
            style={{ filter: filterStyle }}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Inspect Badge */}
          <div className="absolute top-2 left-2.5 z-10 flex items-center">
            <span className="px-2 py-0.5 rounded-lg bg-black/65 backdrop-blur-xs border border-[#C89437]/70 text-[#FBD46E] font-label-sm text-[9px] font-black uppercase tracking-wider">
              {isSelf ? 'MY WARRIOR CARD' : (targetUser.isGroup ? 'CLAN WARBAND' : 'WARRIOR PROFILE')}
            </span>
          </div>

          {/* Close Icon Button */}
          {recipient && (
            <button
              type="button"
              onClick={handleCloseCard}
              className="absolute top-2 right-2.5 w-7 h-7 rounded-full bg-black/65 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer shadow-md z-20 transition-all border border-white/20"
              title="Close Profile"
            >
              <span className="material-symbols-outlined text-sm font-bold">close</span>
            </button>
          )}

          {/* Banner Title Badge */}
          {targetUser.bannerTitle && (
            <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center pointer-events-none">
              <div className="px-2 py-0.5 rounded-lg bg-[#2B180D]/85 backdrop-blur-xs border border-[#C89437] flex items-center gap-1 max-w-full">
                <span className="material-symbols-outlined text-[#FBD46E] text-[11px] font-black">shield</span>
                <span className="font-headline-sm text-[9px] text-[#FBD46E] uppercase font-black tracking-wider truncate">
                  {targetUser.bannerTitle}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Overlapping Avatar & User Information */}
        <div className="px-4 pb-4 -mt-10 flex flex-col items-center text-center bg-[#FFFDF9] relative z-10">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden bg-[#FAF3E8] shadow-[0_6px_16px_rgba(89,53,28,0.25)] border-3 border-[#FFFDF9] ring-3 ring-[#C89437] relative z-10 flex-shrink-0">
            <img
              src={avatarSrc}
              alt={targetUser.username || 'Warrior Avatar'}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Warrior Name & Verified Tag */}
          <div className="mt-2 flex items-center gap-1.5 justify-center max-w-full">
            <h3 className="font-headline-sm text-lg sm:text-xl text-[#3E2415] font-black tracking-wide truncate">
              {targetUser.username || 'Sheru'}
            </h3>
            <span className="w-4 h-4 rounded-full bg-[#895333] text-white flex items-center justify-center text-[10px] shadow-xs flex-shrink-0">
              <span className="material-symbols-outlined text-[10px] font-bold">check</span>
            </span>
          </div>

          {/* Handle & Player Tag */}
          <span className="font-label-sm text-[11px] text-[#895333] font-extrabold uppercase mt-0.5 tracking-wider truncate max-w-full">
            @{targetUser.username || 'Sheru'} • {playerTag}
          </span>

          {/* Motto / Bio Quote */}
          <p className="mt-1.5 font-body-sm text-xs text-[#6E4C38] italic font-bold px-1 leading-snug">
            “{targetUser.description || (targetUser.isGroup ? 'Tactical Clan Warband' : 'Fearless Clash warrior ready for battle.')}”
          </p>

          {/* 3-Column Stats Grid (Fitted neatly without truncation) */}
          <div className="w-full grid grid-cols-3 gap-1.5 mt-3 p-2 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] shadow-inner text-center">
            <div className="flex flex-col items-center justify-center min-w-0">
              <span className="font-label-sm text-[9px] text-[#8A6348] uppercase font-black tracking-wider">
                RANK
              </span>
              <span className="font-headline-sm text-[11px] text-[#24140D] font-black uppercase mt-0.5 truncate w-full">
                {targetUser.role || (targetUser.isGroup ? 'WARBAND' : 'WARRIOR')}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center min-w-0 border-x border-[#E7D6C3] px-0.5">
              <span className="font-label-sm text-[9px] text-[#8A6348] uppercase font-black tracking-wider">
                TROPHIES
              </span>
              <span className="font-headline-sm text-[11px] text-[#895333] font-black mt-0.5 truncate w-full">
                {targetUser.trophies || 2450} ★
              </span>
            </div>

            <div className="flex flex-col items-center justify-center min-w-0">
              <span className="font-label-sm text-[9px] text-[#8A6348] uppercase font-black tracking-wider">
                CLAN
              </span>
              <span className="font-headline-sm text-[11px] text-[#673C21] font-black mt-0.5 truncate w-full">
                {clanName}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-2 mt-3">
            <button
              type="button"
              onClick={handleCloseCard}
              className="py-2 rounded-xl bg-[#E8DAC9] hover:bg-[#DCC8B0] border border-[#CBAF90] text-[#553013] font-headline-sm text-xs font-black uppercase transition-all cursor-pointer shadow-xs active:translate-y-0.5"
            >
              CLOSE
            </button>

            <button
              type="button"
              onClick={handleCopyTag}
              className="py-2 rounded-xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] text-[#412708] border-b-2 border-[#A8740B] font-headline-sm text-xs font-black uppercase shadow-sm active:translate-y-0.5 hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <span>{copiedToast ? 'COPIED!' : 'COPY TAG'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* CLAN INTEL & ROSTER LIST BELOW PROFILE CARD */}
      <div className="bg-[#FFFDF9] border-2 border-[#895333] p-3 rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] flex flex-col gap-2.5 flex-shrink-0">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-xs text-[#3E2415] uppercase tracking-wider font-extrabold">
            CLAN INTEL
          </span>
          <span className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full border uppercase font-black ${
            isOnline 
              ? 'bg-[#FCE58D] border-[#DEB03A] text-[#633C08]' 
              : 'bg-[#F2E5D6] border-[#D1BCA6] text-[#705643]'
          }`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        {/* War Preparedness Gauge */}
        <div className="p-2 bg-[#FAF3E8] border border-[#DFCAAE] rounded-xl flex items-center gap-2.5 shadow-sm">
          <div className="w-10 h-10 relative flex-shrink-0 flex items-center justify-center">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
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
            <span className="absolute font-label-md text-[10px] text-[#663A0F] font-black">84%</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-xs text-[#24140D] font-black">Siege Deck Ready</span>
            <span className="font-body-sm text-[10px] text-[#775239]">21/25 defense bases verified</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-1 pt-1">
          <button
            type="button"
            onClick={logout}
            className="w-full py-1.5 px-3 rounded-xl bg-[#FEECEC] hover:bg-[#FCD8D8] border border-[#F3BABA] text-[#B71C1C] font-label-sm text-[11px] uppercase tracking-wider flex items-center justify-between transition-colors font-black cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">logout</span>
              RETREAT FROM CLAN
            </span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>

      </div>

    </aside>
  );
};
