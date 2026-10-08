"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/NavigationHeader';
import { AuthProtected } from '@/components/AuthProtected';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api';
import { sfx } from '@/lib/sfx';

const AVATAR_PRESETS = [
  {
    id: 'bk',
    name: 'Barbarian King',
    img: '/avatars/barbarian.png',
  },
  {
    id: 'aq',
    name: 'Archer Queen',
    img: '/avatars/archer.png',
  },
  {
    id: 'pk',
    name: 'Grand P.E.K.K.A',
    img: '/avatars/pekka.png',
  },
  {
    id: 'armored',
    name: 'Armored Knight',
    img: '/avatars/armored.png',
  },
  {
    id: 'sorcerer',
    name: 'Dark Sorcerer',
    img: '/avatars/sorcerer.png',
  },
  {
    id: 'golem',
    name: 'Dark Elixir Golem',
    img: '/avatars/golem.png',
  },
  {
    id: 'champion',
    name: 'Clash Champion',
    img: '/avatars/champion.png',
  },
  {
    id: 'th',
    name: 'Town Hall Citadel',
    img: '/avatars/townhall.png',
  },
];

const BANNER_PRESETS = [
  {
    id: 'arena',
    name: 'Legendary League Arena',
    img: '/banners/legendary-league.png',
  },
  {
    id: 'war',
    name: 'Clan War Battlefield',
    img: '/banners/war-battlefield.png',
  },
  {
    id: 'village',
    name: 'Daytime Village',
    img: '/banners/daytime-village.png',
  },
  {
    id: 'dark-fortress',
    name: 'Dark Fortress Citadel',
    img: '/banners/dark-fortress.png',
  },
  {
    id: 'epic-kingdom',
    name: 'Epic Kingdom Battlefield',
    img: '/banners/epic-kingdom.png',
  },
  {
    id: 'citadel',
    name: 'Imposing Citadel Peak',
    img: '/banners/imposing-citadel.png',
  },
  {
    id: 'serene',
    name: 'Serene Alpine Village',
    img: '/banners/serene-village.png',
  },
  {
    id: 'dramatic',
    name: 'Dramatic War Frontline',
    img: '/banners/dramatic-warfront.png',
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [creed, setCreed] = useState('');
  const [status, setStatus] = useState('Online (War Room Ready)');
  const [statusPip, setStatusPip] = useState('bg-emerald-500');

  const [selectedAvatar, setSelectedAvatar] = useState('bk');
  const [tempAvatar, setTempAvatar] = useState('bk');
  const [selectedBanner, setSelectedBanner] = useState('arena');
  const [tempBanner, setTempBanner] = useState('arena');

  const [activeEditRow, setActiveEditRow] = useState<'name' | 'username' | 'creed' | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCodexMenuOpen, setIsCodexMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.username || 'Shahnawaz');
      setUsername(user.username || 'warrior_x');
      setCreed(user.description || 'Building. Fighting. Coding. Defending the Northern Citadel with valkyrie strikes and socket streams.');
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const copyPlayerTag = () => {
    sfx.playClick();
    navigator.clipboard.writeText('#9YQQ88V');
    showToast('Player Tag #9YQQ88V Copied!');
  };

  const currentAvatarObj = AVATAR_PRESETS.find((a) => a.id === selectedAvatar) || AVATAR_PRESETS[0];
  const currentBannerObj = BANNER_PRESETS.find((b) => b.id === selectedBanner) || BANNER_PRESETS[0];

  const handleSaveProfile = async (field: 'name' | 'username' | 'creed', value: string) => {
    try {
      sfx.playClick();
      const payload: any = {};
      if (field === 'name' || field === 'username') payload.username = value.trim();
      if (field === 'creed') payload.description = value.trim();

      const updated = await userApi.updateProfile(payload);
      updateUser(updated);
      sfx.playClanReward();
      setActiveEditRow(null);
      showToast('Warrior Profile Updated Successfully!');
    } catch (err: any) {
      sfx.playError();
      showToast(`Error: ${err.message || 'Update failed'}`);
    }
  };

  const confirmAvatarSelection = () => {
    sfx.playClanReward();
    setSelectedAvatar(tempAvatar);
    setIsAvatarModalOpen(false);
    showToast('Hero Avatar Updated!');
  };

  const confirmBannerSelection = () => {
    sfx.playClanReward();
    setSelectedBanner(tempBanner);
    setIsBannerModalOpen(false);
    showToast('War Banner Canvas Applied!');
  };

  return (
    <AuthProtected>
      <div className="bg-[#F6EFE6] font-body-md text-[#24140D] selection:bg-[#f5b823]/30 selection:text-[#674b00] min-h-screen">
        <NavigationHeader />

        <main className="w-full pt-20 bg-[#F6EFE6] min-h-screen">
          <div className="flex flex-col w-full">

            {/* Top Command Ribbon / Breadcrumb Header */}
            <section className="w-full px-4 lg:px-8 py-3.5 bg-gradient-to-b from-[#FBF2E5] to-[#F5E6D3] border-b-2 border-[#895333] shadow-sm">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Breadcrumb & Title */}
                <div className="flex items-center gap-3">
                  <Link
                    href="/chats"
                    onClick={() => sfx.playClick()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4E8D8] border border-[#CDB194] border-b-2 border-b-[#987654] hover:bg-[#FFF9EE] text-[#693E1B] font-label-md text-xs uppercase tracking-wider transition-all shadow-sm active:translate-y-0.5 font-bold"
                  >
                    <span className="material-symbols-outlined text-base text-[#895333]">arrow_back</span>
                    <span>Back to War Room</span>
                  </Link>
                  <div className="h-6 w-px bg-[#D8C2AA] hidden sm:block"></div>
                  <div>
                    <h1 className="font-headline-sm text-lg text-[#3E2415] uppercase tracking-wider flex items-center gap-2 font-black">
                      Edit Warrior Profile
                      <span className="px-2 py-0.5 rounded bg-[#FBD46E] text-[#4A2F08] border border-[#DEB03A] font-label-sm text-[11px] uppercase font-black tracking-wider">
                        Lv. {user?.level || 72}
                      </span>
                    </h1>
                    <p className="font-body-sm text-xs text-[#6E4C38]">
                      Clan Rank: {user?.role || 'Chieftain'} • Valhalla Vanguard Legion #9YQQ88V
                    </p>
                  </div>
                </div>

                {/* Right: Action Bar */}
                <div className="flex items-center gap-2 relative">
                  <button
                    onClick={() => {
                      sfx.playClick();
                      setIsPreviewModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4E8D8] border border-[#CDB194] border-b-2 border-b-[#987654] hover:bg-[#FFF9EE] text-[#3E2415] font-label-md text-xs uppercase tracking-wider transition-all shadow-sm active:translate-y-0.5 font-black cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#895333] text-base">visibility</span>
                    <span>Preview Public Card</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => {
                        sfx.playClick();
                        setIsCodexMenuOpen(!isCodexMenuOpen);
                      }}
                      className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4E8D8] border border-[#CDB194] border-b-2 border-b-[#987654] hover:bg-[#FFF9EE] text-[#3E2415] flex items-center justify-center transition-all shadow-sm active:translate-y-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg text-[#6E4C38]">more_vert</span>
                    </button>

                    {/* Dropdown Codex Menu */}
                    {isCodexMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-[#FFFDF9] border-2 border-[#895333] rounded-xl shadow-[0_8px_20px_rgba(89,53,28,0.2)] p-1.5 z-30 animate-fadeIn">
                        <button
                          onClick={() => {
                            setIsCodexMenuOpen(false);
                            copyPlayerTag();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F7EFE4] flex items-center gap-2 text-[#3E2415] font-body-sm text-xs transition-colors cursor-pointer font-bold"
                        >
                          <span className="material-symbols-outlined text-[#895333] text-base">content_copy</span>
                          <span>Copy Tag #9YQQ88V</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsCodexMenuOpen(false);
                            copyPlayerTag();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F7EFE4] flex items-center gap-2 text-[#3E2415] font-body-sm text-xs transition-colors cursor-pointer font-bold"
                        >
                          <span className="material-symbols-outlined text-[#895333] text-base">share</span>
                          <span>Share Battle Ledger</span>
                        </button>
                        <div className="my-1 border-t border-[#E5D2BF]"></div>
                        <button
                          onClick={() => {
                            setIsCodexMenuOpen(false);
                            sfx.playLogout();
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FEECEC] flex items-center gap-2 text-[#B71C1C] font-body-sm text-xs transition-colors cursor-pointer font-black"
                        >
                          <span className="material-symbols-outlined text-[#B71C1C] text-base">logout</span>
                          <span>Retire from War Room</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Main Chassis Grid */}
            <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">

              {/* Profile Hero Card */}
              <div className="w-full bg-[#FFFDF9] border-2 border-[#895333] rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] overflow-hidden">
                {/* Panoramic Battle Banner */}
                <div className="relative w-full h-64 md:h-80 lg:h-96 bg-[#EFE0CE] overflow-hidden group">
                  <img
                    src={currentBannerObj.img}
                    alt={currentBannerObj.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"></div>

                  <button
                    onClick={() => {
                      sfx.playClick();
                      setTempBanner(selectedBanner);
                      setIsBannerModalOpen(true);
                    }}
                    className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFDF9]/90 backdrop-blur-md text-[#3E2415] border border-[#CDB194] font-label-sm text-xs uppercase tracking-wider hover:bg-[#FFFFFF] transition-all shadow-md font-black cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#895333] text-base">photo_camera</span>
                    <span>Change War Banner</span>
                  </button>

                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2B180D]/85 backdrop-blur-md border border-[#C89437]/60">
                    <span className="material-symbols-outlined text-[#FBD46E] text-sm">shield</span>
                    <span className="font-label-sm text-xs text-[#FFF3E3] uppercase tracking-wider font-extrabold">Titan League I</span>
                  </div>
                </div>

                {/* Overlapping Avatar & Identity Deck */}
                <div className="px-5 md:px-6 pb-5 pt-0 relative bg-gradient-to-b from-[#FFFDF9] to-[#FAF5ED]">
                  <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 -mt-16 md:-mt-20">

                    {/* Avatar + Presence */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                      <div className="relative group">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-[#FAF3E8] border-4 border-[#FFFDF9] ring-2 ring-[#C89437] shadow-[0_6px_16px_rgba(89,53,28,0.25)] relative">
                          <img
                            src={currentAvatarObj.img}
                            alt={currentAvatarObj.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <button
                          onClick={() => {
                            sfx.playClick();
                            setTempAvatar(selectedAvatar);
                            setIsAvatarModalOpen(true);
                          }}
                          aria-label="Change Avatar"
                          className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-gradient-to-b from-[#FCE58D] to-[#E9B634] text-[#4A2F08] border-2 border-[#B8861B] flex items-center justify-center shadow-md hover:brightness-105 transition-all hover:scale-105 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">photo_camera</span>
                        </button>
                      </div>

                      {/* Identity Summary */}
                      <div className="flex flex-col text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                          <h2 className="font-headline-md text-2xl font-black text-[#3E2415] tracking-wide">
                            {displayName}
                          </h2>
                          <span className="material-symbols-outlined text-[#895333] text-xl" title="Verified Champion">
                            verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* War Creed Quote Banner */}
                  <div className="mt-4 p-3.5 rounded-xl bg-[#FAF3E8] border border-[#DECAAF] shadow-inner flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#895333] text-xl select-none">
                      format_quote
                    </span>
                    <p className="font-body-md text-sm text-[#5B3E2B] italic font-medium">
                      “{creed}”
                    </p>
                  </div>
                </div>
              </div>

              {/* Dual Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT: Profile Customization List (8 Cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                  {/* Section A: Profile Identity Rows */}
                  <div className="bg-[#FFFDF9] border-2 border-[#895333] rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] p-5 md:p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5D2BF]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#895333] text-xl">shield_person</span>
                        <h3 className="font-headline-sm text-base text-[#3E2415] uppercase font-black">
                          Profile Information
                        </h3>
                      </div>
                      <span className="font-label-sm text-[11px] text-[#8A6348] uppercase tracking-widest font-bold">
                        Public Roster Entry
                      </span>
                    </div>

                    {/* Display Name Row */}
                    <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] transition-all hover:bg-[#FFFBF5]">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-[10px] text-[#8A6348] uppercase tracking-wider font-bold">
                            Display Name
                          </span>
                          <span className="font-headline-sm text-lg text-[#24140D] mt-0.5 font-bold">
                            {displayName}
                          </span>
                          <span className="font-body-sm text-xs text-[#6E4C38]">
                            Visible across clan channels, raid rosters, and battle logs
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            sfx.playClick();
                            setActiveEditRow(activeEditRow === 'name' ? null : 'name');
                          }}
                          className="p-2 rounded-lg bg-[#EFE0CE] border border-[#D1B89F] hover:bg-[#E5D2BC] text-[#5C381E] transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      </div>

                      {/* Inline Edit Box */}
                      {activeEditRow === 'name' && (
                        <div className="mt-3 pt-3 border-t border-[#DFCAAE] bg-[#FAF3E8]/80 p-3.5 rounded-xl animate-fadeIn">
                          <label className="block font-label-sm text-[11px] text-[#8A6348] uppercase mb-1 font-bold">
                            Modify Warrior Handle
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              maxLength={24}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#CEB194] text-[#24140D] font-headline-sm text-base outline-none focus:ring-2 focus:ring-[#C89437] shadow-inner font-bold"
                            />
                            <span className="absolute right-3 top-3 font-label-sm text-xs text-[#8A6348]">
                              {displayName.length}/24
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-3">
                            <button
                              onClick={() => setActiveEditRow(null)}
                              className="px-3.5 py-1.5 rounded-lg text-[#6E4C38] hover:text-[#24140D] font-label-md text-xs uppercase font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveProfile('name', displayName)}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] text-[#412708] border-b-2 border-[#A8740B] font-label-md text-xs uppercase font-black shadow-sm active:translate-y-0.5 cursor-pointer"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Username Handle Row */}
                    <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] transition-all hover:bg-[#FFFBF5]">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-label-sm text-[10px] text-[#8A6348] uppercase tracking-wider font-bold">
                              Clan Username Handle
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#E4ECD8] text-[#2E741D] font-label-sm text-[10px] font-bold border border-[#C5D9B0]">
                              <span className="material-symbols-outlined text-xs">check_circle</span> Available
                            </span>
                          </div>
                          <span className="font-headline-sm text-lg text-[#895333] mt-0.5 font-bold">
                            @{username}
                          </span>
                          <span className="font-body-sm text-xs text-[#6E4C38]">
                            Permanent tag for clan invites, direct alerts, and battle telemetry
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            sfx.playClick();
                            setActiveEditRow(activeEditRow === 'username' ? null : 'username');
                          }}
                          className="p-2 rounded-lg bg-[#EFE0CE] border border-[#D1B89F] hover:bg-[#E5D2BC] text-[#5C381E] transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      </div>

                      {/* Inline Edit Box */}
                      {activeEditRow === 'username' && (
                        <div className="mt-3 pt-3 border-t border-[#DFCAAE] bg-[#FAF3E8]/80 p-3.5 rounded-xl animate-fadeIn">
                          <label className="block font-label-sm text-[11px] text-[#8A6348] uppercase mb-1 font-bold">
                            Set Unique Username
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 font-headline-sm text-base text-[#895333] font-bold">@</span>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              maxLength={20}
                              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#CEB194] text-[#24140D] font-headline-sm text-base outline-none focus:ring-2 focus:ring-[#C89437] shadow-inner font-bold"
                            />
                          </div>
                          <p className="font-body-sm text-xs text-[#6E4C38] mt-1.5">Letters, numbers, underscores. Min 4 characters.</p>
                          <div className="flex items-center justify-end gap-2 mt-3">
                            <button
                              onClick={() => setActiveEditRow(null)}
                              className="px-3.5 py-1.5 rounded-lg text-[#6E4C38] hover:text-[#24140D] font-label-md text-xs uppercase font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveProfile('username', username)}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] text-[#412708] border-b-2 border-[#A8740B] font-label-md text-xs uppercase font-black shadow-sm active:translate-y-0.5 cursor-pointer"
                            >
                              Confirm Tag
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* About / War Creed Row */}
                    <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] transition-all hover:bg-[#FFFBF5]">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col max-w-xl">
                          <span className="font-label-sm text-[10px] text-[#8A6348] uppercase tracking-wider font-bold">
                            About / Clan Creed
                          </span>
                          <p className="font-body-md text-sm text-[#3E2415] mt-1 leading-relaxed font-medium">
                            {creed}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            sfx.playClick();
                            setActiveEditRow(activeEditRow === 'creed' ? null : 'creed');
                          }}
                          className="p-2 rounded-lg bg-[#EFE0CE] border border-[#D1B89F] hover:bg-[#E5D2BC] text-[#5C381E] transition-all self-start cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      </div>

                      {/* Inline Edit Box */}
                      {activeEditRow === 'creed' && (
                        <div className="mt-3 pt-3 border-t border-[#DFCAAE] bg-[#FAF3E8]/80 p-3.5 rounded-xl animate-fadeIn">
                          <label className="block font-label-sm text-[11px] text-[#8A6348] uppercase mb-1 font-bold">
                            Edit War Creed Quote
                          </label>
                          <div className="relative">
                            <textarea
                              value={creed}
                              onChange={(e) => setCreed(e.target.value)}
                              maxLength={160}
                              rows={3}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#CEB194] text-[#24140D] font-body-md text-sm outline-none focus:ring-2 focus:ring-[#C89437] shadow-inner font-medium resize-none"
                            />
                            <span className="absolute right-3 bottom-2 font-label-sm text-xs text-[#8A6348]">
                              {creed.length}/160
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-3">
                            <button
                              onClick={() => setActiveEditRow(null)}
                              className="px-3.5 py-1.5 rounded-lg text-[#6E4C38] hover:text-[#24140D] font-label-md text-xs uppercase font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveProfile('creed', creed)}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] text-[#412708] border-b-2 border-[#A8740B] font-label-md text-xs uppercase font-black shadow-sm active:translate-y-0.5 cursor-pointer"
                            >
                              Publish Creed
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Avatar & Banner Swapper Strip */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">

                      {/* Avatar Picker Box */}
                      <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={currentAvatarObj.img}
                            alt={currentAvatarObj.name}
                            className="w-12 h-12 rounded-full object-cover bg-[#EFE0CE] ring-2 ring-[#D4A359]"
                          />
                          <div>
                            <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold">Hero Avatar</span>
                            <div className="font-label-md text-xs text-[#24140D] font-black">{currentAvatarObj.name}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            sfx.playClick();
                            setTempAvatar(selectedAvatar);
                            setIsAvatarModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4E8D8] border border-[#CDB194] border-b-2 border-b-[#987654] hover:bg-[#FFF9EE] text-[#5C381E] font-label-md text-xs uppercase tracking-wider font-black shadow-sm active:translate-y-0.5 cursor-pointer"
                        >
                          Select
                        </button>
                      </div>

                      {/* Banner Picker Box */}
                      <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-9 rounded-lg overflow-hidden bg-[#EFE0CE] border border-[#D4A359]">
                            <img
                              src={currentBannerObj.img}
                              alt={currentBannerObj.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold">War Canvas</span>
                            <div className="font-label-md text-xs text-[#24140D] font-black">{currentBannerObj.name}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            sfx.playClick();
                            setTempBanner(selectedBanner);
                            setIsBannerModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4E8D8] border border-[#CDB194] border-b-2 border-b-[#987654] hover:bg-[#FFF9EE] text-[#5C381E] font-label-md text-xs uppercase tracking-wider font-black shadow-sm active:translate-y-0.5 cursor-pointer"
                        >
                          Select
                        </button>
                      </div>

                    </div>
                  </div>

                </div>

                {/* RIGHT: Credentials Card (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                  {/* Supercell Guard Credentials Card */}
                  <div className="bg-[#FFFDF9] border-2 border-[#895333] rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] p-5 md:p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5D2BF]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#895333] text-xl">verified_user</span>
                        <h3 className="font-headline-sm text-base text-[#3E2415] uppercase font-black">Supercell Guard</h3>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E4ECD8] text-[#2E741D] font-label-sm text-[10px] font-black border border-[#C5D9B0]">
                        <span className="material-symbols-outlined text-xs">lock</span> Protected
                      </span>
                    </div>

                    {/* Email Credential */}
                    <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] flex flex-col gap-1">
                      <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold">Registered Vault ID</span>
                      <div className="flex items-center justify-between">
                        <span className="font-body-md text-xs text-[#24140D] font-mono font-bold">{user?.email || 'warrior001@demo.local'}</span>
                        <span className="material-symbols-outlined text-[#2E741D] text-sm" title="Cryptographically Sealed">check_circle</span>
                      </div>
                    </div>

                    {/* Player Tag & Quick Copy */}
                    <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] flex flex-col gap-1">
                      <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold">Official Player Tag</span>
                      <div className="flex items-center justify-between">
                        <span className="font-headline-sm text-base text-[#895333] tracking-widest font-mono font-bold">#9YQQ88V</span>
                        <button
                          onClick={copyPlayerTag}
                          className="px-3 py-1 rounded-xl bg-[#EFE0CE] border border-[#D1B89F] hover:bg-[#E5D2BC] text-[#5C381E] font-label-sm text-xs uppercase flex items-center gap-1 transition-all cursor-pointer font-bold"
                        >
                          <span className="material-symbols-outlined text-xs">content_copy</span> Copy
                        </button>
                      </div>
                    </div>

                    {/* Tenure Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] flex flex-col text-center">
                        <span className="font-headline-lg text-2xl font-black text-[#895333]">248</span>
                        <span className="font-label-sm text-[10px] text-[#8A6348] uppercase mt-1 font-bold">Raids Commanded</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] flex flex-col text-center">
                        <span className="font-headline-lg text-2xl font-black text-[#673C21]">99.4%</span>
                        <span className="font-label-sm text-[10px] text-[#8A6348] uppercase mt-1 font-bold">War Stars Ratio</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF5ED] text-center font-body-sm text-xs text-[#6E4C38] border border-[#E7D6C3]">
                      Joined Campaign: October 2026 • Tier 1 Veteran
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </main>

        {/* MODAL 1: SELECT AVATAR */}
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-xl bg-[#FFFDF9] rounded-3xl shadow-[0_16px_50px_rgba(89,53,28,0.3)] overflow-hidden flex flex-col border-4 border-[#C89437]">
              <div className="px-6 py-4 bg-[#FAF5ED] flex items-center justify-between border-b-2 border-[#895333]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#895333] text-xl">military_tech</span>
                  <h3 className="font-headline-sm text-base text-[#3E2415] uppercase font-black">Select Warrior Avatar</h3>
                </div>
                <button
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#EFE0CE] hover:bg-[#E5D2BC] flex items-center justify-center text-[#5C381E] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4 bg-[#FAF3E8]">
                <p className="font-body-sm text-xs text-[#6E4C38]">
                  Choose your combat avatar icon to represent your command in war rooms and chat feeds.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVATAR_PRESETS.map((av) => (
                    <div
                      key={av.id}
                      onClick={() => {
                        sfx.playClick();
                        setTempAvatar(av.id);
                      }}
                      className={`cursor-pointer flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#FFFDF9] hover:bg-[#FFF9EE] transition-all border-2 ${tempAvatar === av.id ? 'border-[#C89437] ring-2 ring-[#F5B823] scale-105' : 'border-[#E7D6C3]'
                        }`}
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-[#EFE0CE] shadow-md border-2 border-[#D4A359]">
                        <img src={av.img} alt={av.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-label-sm text-[11px] text-[#3E2415] uppercase font-bold text-center leading-tight">
                        {av.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-[#FAF5ED] flex items-center justify-end gap-3 border-t-2 border-[#895333]">
                <button
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[#6E4C38] hover:text-[#24140D] font-label-md text-xs uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAvatarSelection}
                  className="px-5 py-2 rounded-xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] text-[#412708] border-b-2 border-[#A8740B] font-label-md text-xs uppercase shadow-sm active:translate-y-0.5 font-black cursor-pointer"
                >
                  Confirm Avatar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: SELECT COVER BANNER */}
        {isBannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-2xl bg-[#FFFDF9] rounded-3xl shadow-[0_16px_50px_rgba(89,53,28,0.3)] overflow-hidden flex flex-col border-4 border-[#C89437]">
              <div className="px-6 py-4 bg-[#FAF5ED] flex items-center justify-between border-b-2 border-[#895333]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#895333] text-xl">wallpaper</span>
                  <h3 className="font-headline-sm text-base text-[#3E2415] uppercase font-black">Choose Battlefield Banner</h3>
                </div>
                <button
                  onClick={() => setIsBannerModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#EFE0CE] hover:bg-[#E5D2BC] flex items-center justify-center text-[#5C381E] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto bg-[#FAF3E8]">
                <p className="font-body-sm text-xs text-[#6E4C38]">
                  Select a legendary scenic banner to display atop your war codex.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {BANNER_PRESETS.map((bn) => (
                    <div
                      key={bn.id}
                      onClick={() => {
                        sfx.playClick();
                        setTempBanner(bn.id);
                      }}
                      className={`cursor-pointer flex flex-col gap-2 p-2.5 rounded-2xl bg-[#FFFDF9] hover:bg-[#FFF9EE] transition-all border-2 ${tempBanner === bn.id ? 'border-[#C89437] ring-2 ring-[#F5B823] scale-105' : 'border-[#E7D6C3]'
                        }`}
                    >
                      <div className="w-full h-28 rounded-lg overflow-hidden bg-[#EFE0CE]">
                        <img src={bn.img} alt={bn.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="font-label-sm text-xs text-[#3E2415] uppercase font-bold">{bn.name}</span>
                        {selectedBanner === bn.id && (
                          <span className="text-xs text-[#895333] font-bold">Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-[#FAF5ED] flex items-center justify-end gap-3 border-t-2 border-[#895333]">
                <button
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[#6E4C38] hover:text-[#24140D] font-label-md text-xs uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBannerSelection}
                  className="px-5 py-2 rounded-xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] text-[#412708] border-b-2 border-[#A8740B] font-label-md text-xs uppercase shadow-sm active:translate-y-0.5 font-black cursor-pointer"
                >
                  Apply War Banner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: PUBLIC PROFILE PREVIEW CARD */}
        {isPreviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl shadow-[0_20px_50px_rgba(89,53,28,0.35)] overflow-hidden flex flex-col border-4 border-[#C89437]">
              {/* Mini Preview Hero */}
              <div className="relative w-full h-44 sm:h-48 bg-[#EFE0CE] overflow-hidden">
                <img src={currentBannerObj.img} alt={currentBannerObj.name} className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"></div>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer shadow-md z-20"
                >
                  <span className="material-symbols-outlined text-base font-bold">close</span>
                </button>
              </div>

              {/* Overlapping Preview Avatar */}
              <div className="px-4 pb-6 -mt-14 flex flex-col items-center text-center bg-[#FFFDF9] relative z-10">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-[#FAF3E8] shadow-[0_8px_20px_rgba(89,53,28,0.3)] border-4 border-[#FFFDF9] ring-2 ring-[#C89437] relative z-10 flex-shrink-0">
                  <img src={currentAvatarObj.img} alt={currentAvatarObj.name} className="w-full h-full object-cover object-center" />
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="font-headline-sm text-lg text-[#3E2415] font-black">{displayName}</span>
                  <span className="material-symbols-outlined text-[#895333] text-base">verified</span>
                </div>
                <span className="font-label-sm text-xs text-[#895333] font-bold">@{username} • #9YQQ88V</span>
                <p className="mt-2 font-body-sm text-xs text-[#6E4C38] italic px-4">
                  “{creed}”
                </p>

                {/* Stats Grid in Preview */}
                <div className="w-full grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3]">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold">Rank</span>
                    <span className="font-label-md text-xs text-[#24140D] font-bold">{user?.role || 'Chieftain'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold">Trophies</span>
                    <span className="font-label-md text-xs text-[#895333] font-black">{user?.trophies || 2450} ★</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold">Clan</span>
                    <span className="font-label-md text-xs text-[#673C21] font-bold truncate">Valhalla</span>
                  </div>
                </div>

                <div className="w-full mt-4 flex gap-2">
                  <button
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-[#EFE0CE] border border-[#D1B89F] hover:bg-[#E5D2BC] text-[#5C381E] font-label-md text-xs uppercase font-bold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={copyPlayerTag}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] text-[#412708] border-b-2 border-[#A8740B] font-label-md text-xs uppercase font-black shadow-sm cursor-pointer"
                  >
                    Copy Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification Pill */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full bg-[#3E2415] text-[#FBD46E] font-label-md text-xs uppercase tracking-wider shadow-[0_8px_20px_rgba(0,0,0,0.4)] flex items-center gap-2 border border-[#C89437]/50 animate-fadeIn">
            <span className="material-symbols-outlined text-base">check</span>
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </AuthProtected>
  );
}
