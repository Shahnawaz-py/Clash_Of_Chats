"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/NavigationHeader';
import { AuthProtected } from '@/components/AuthProtected';
import { userApi, clanApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface WarriorItem {
  id: string;
  name: string;
  handle: string;
  tag: string;
  level: number;
  avatar: string;
  selected: boolean;
}

const bannerStyles: Record<string, { class: string; icon: string }> = {
  'crimson-fire': {
    class: 'bg-gradient-to-r from-[#8B1E1E] via-[#B71C1C] to-[#8B1E1E]',
    icon: 'local_fire_department',
  },
  'royal-dragon': {
    class: 'bg-gradient-to-r from-[#0F3868] via-[#1565C0] to-[#0F3868]',
    icon: 'cruelty_free',
  },
  'emerald-axes': {
    class: 'bg-gradient-to-r from-[#7F0000] via-[#C62828] to-[#7F0000]',
    icon: 'swords',
  },
  'golden-lion': {
    class: 'bg-gradient-to-r from-[#6A3F03] via-[#D48806] to-[#6A3F03]',
    icon: 'wb_sunny',
  },
};

const avatarIcons: Record<string, string> = {
  shield: 'shield',
  skull: 'skull',
  crown: 'crown',
  target: 'adjust',
};

const DEFAULT_WARRIORS: WarriorItem[] = [
  { id: 'w1', name: 'Ahmed', handle: '@ahmed_clash', tag: '#8Y9QQ9P', level: 64, avatar: 'shield', selected: true },
  { id: 'w2', name: 'Sara', handle: '@valkyrie_sara', tag: '#2LL9P0R', level: 58, avatar: 'cruelty_free', selected: true },
  { id: 'w3', name: 'Ali', handle: '@ali_spear', tag: '#99VCR8Q', level: 49, avatar: 'sports_martial_arts', selected: true },
  { id: 'w4', name: 'Viktor', handle: '@viktor_v', tag: '#80PR29X', level: 70, avatar: 'military_tech', selected: false },
  { id: 'w5', name: 'Valkyrie Rose', handle: '@rose_battle', tag: '#44TY71K', level: 52, avatar: 'local_fire_department', selected: false },
  { id: 'w6', name: 'Ragnar Stone', handle: '@ragnar_north', tag: '#67KL88N', level: 61, avatar: 'fitness_center', selected: false },
];

export default function CreateClanPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [clanName, setClanName] = useState('Valhalla Vanguard');
  const [description, setDescription] = useState(
    'Brave warriors defending the northern fortress. Active daily in war raids and tactical skirmishes. Always donate before asking!'
  );
  const [bannerPattern, setBannerPattern] = useState('crimson-fire');
  const [shieldEmblem, setShieldEmblem] = useState('shield');
  const [searchQuery, setSearchQuery] = useState('');
  const [warriors, setWarriors] = useState<WarriorItem[]>(DEFAULT_WARRIORS);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  // Load real registered warriors from backend
  useEffect(() => {
    const fetchWarriors = async () => {
      try {
        setLoadingUsers(true);
        const users = await userApi.getUsers();
        if (Array.isArray(users) && users.length > 0) {
          const mapped: WarriorItem[] = users
            .filter((u: any) => u._id !== user?._id)
            .map((u: any, idx: number) => ({
              id: u._id,
              name: u.username,
              handle: `@${u.username.toLowerCase()}`,
              tag: `#${u._id.substring(u._id.length - 6).toUpperCase()}`,
              level: u.level || 50 + idx * 3,
              avatar: idx % 2 === 0 ? 'shield' : 'military_tech',
              selected: idx < 2,
            }));

          if (mapped.length < 4) {
            const combined = [...mapped];
            DEFAULT_WARRIORS.forEach((dw) => {
              if (!combined.some((m) => m.name.toLowerCase() === dw.name.toLowerCase())) {
                combined.push(dw);
              }
            });
            setWarriors(combined);
          } else {
            setWarriors(mapped);
          }
        }
      } catch (err) {
        console.error('[Fetch Warriors Error]', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchWarriors();
  }, [user?._id]);

  const toggleWarrior = (id: string) => {
    setWarriors((prev) =>
      prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w))
    );
  };

  const removeWarrior = (id: string) => {
    setWarriors((prev) =>
      prev.map((w) => (w.id === id ? { ...w, selected: false } : w))
    );
  };

  const selectedWarriors = warriors.filter((w) => w.selected);

  const filteredWarriors = warriors.filter((w) => {
    const q = searchQuery.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.handle.toLowerCase().includes(q) ||
      w.tag.toLowerCase().includes(q)
    );
  });

  const handleForgeClan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clanName.trim()) {
      setErrorMessage('Please enter a clan name before forging!');
      return;
    }

    try {
      setIsSubmitting(true);
      const memberIds = selectedWarriors.map((w) => w.id);

      await clanApi.createClan({
        name: clanName.trim(),
        description: description.trim(),
        bannerPattern,
        shieldEmblem,
        memberIds,
      });

      setShowToast(true);

      setTimeout(() => {
        router.push('/clans');
      }, 2500);
    } catch (err: any) {
      console.warn('[Create Clan Warning]', err?.message || err);
      setErrorMessage(err.message || 'Failed to forge clan. Please try again.');
      setIsSubmitting(false);
    }
  };

  const currentBanner = bannerStyles[bannerPattern] || bannerStyles['crimson-fire'];
  const currentAvatarIcon = avatarIcons[shieldEmblem] || 'shield';

  return (
    <AuthProtected>
      <div className="bg-[#F6EFE6] font-body-md text-[#24140D] selection:bg-[#f5b823]/30 selection:text-[#674b00] min-h-screen flex flex-col">
        <NavigationHeader />

        <main className="w-full pt-20 bg-[#F6EFE6] min-h-screen flex-1">
          <div className="flex flex-col w-full">
            <div className="w-full max-w-5xl mx-auto px-4 py-8 lg:py-10">

              {/* Main Fortress Container Plaque */}
              <div className="relative bg-[#4A2814] rounded-3xl p-4 sm:p-7 lg:p-9 shadow-[0_12px_0_#231208,0_20px_35px_rgba(0,0,0,0.4)]">
                {/* Brass Corner Studs */}
                <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-[#F5B823] shadow-[inset_0_2px_2px_#FFF9C4,0_3px_4px_#1B0B04]" />
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#F5B823] shadow-[inset_0_2px_2px_#FFF9C4,0_3px_4px_#1B0B04]" />
                <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-[#F5B823] shadow-[inset_0_2px_2px_#FFF9C4,0_3px_4px_#1B0B04]" />
                <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-[#F5B823] shadow-[inset_0_2px_2px_#FFF9C4,0_3px_4px_#1B0B04]" />

                {/* Inner Parchment Strongbox Plate */}
                <div className="bg-[#F6EFE6] rounded-2xl p-5 sm:p-7 lg:p-8 shadow-[inset_0_3px_8px_rgba(44,24,16,0.18)]">
                  <form onSubmit={handleForgeClan} className="flex flex-col gap-8" id="createClanForm">

                    {errorMessage && (
                      <div className="p-4 rounded-xl bg-[#7F0000] border-2 border-[#EF5350] text-[#FFCDD2] shadow-[0_4px_12px_rgba(127,0,0,0.5)] flex items-center justify-between gap-3 animate-headShake">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#FFCDD2] text-2xl font-bold">warning</span>
                          <span className="font-headline-sm text-headline-sm text-white tracking-wide">{errorMessage}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setErrorMessage(null)}
                          className="text-[#FFCDD2] hover:text-white transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                      </div>
                    )}

                    {/* TOP ROW: Clan Name & Live Banner / Heraldry Previews */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">

                      {/* LEFT COLUMN: Clan Name & Description */}
                      <div className="lg:col-span-7 flex flex-col gap-6">

                        {/* 1. Clan Name Input */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 font-headline-sm text-headline-sm text-[#24140D] uppercase tracking-wide" htmlFor="clanNameInput">
                              <span className="material-symbols-outlined text-[#f5b823] text-xl">military_tech</span>
                              Clan Name
                            </label>
                            <span className="font-label-sm text-label-sm text-[#825336] uppercase font-bold tracking-wider">Required • Max 24</span>
                          </div>
                          <div className="relative rounded-xl bg-[#E8DAC9] shadow-[inset_0_3px_5px_rgba(44,24,16,0.22)] p-1">
                            <div className="flex items-center gap-3 px-3 py-1">
                              <span className="material-symbols-outlined text-[#825336] text-2xl">label</span>
                              <input
                                className="w-full bg-transparent border-0 focus:ring-0 text-[#24140D] font-headline-sm text-headline-sm placeholder:text-[#895333]/70 focus:outline-none"
                                id="clanNameInput"
                                maxLength={24}
                                name="clanName"
                                placeholder="e.g. Valhalla Vanguard"
                                type="text"
                                value={clanName}
                                onChange={(e) => setClanName(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 4. Clan Description Textarea */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 font-headline-sm text-headline-sm text-[#24140D] uppercase tracking-wide" htmlFor="clanDescriptionInput">
                              <span className="material-symbols-outlined text-[#f5b823] text-xl">history_edu</span>
                              Clan Description
                            </label>
                            <span className="font-label-sm text-label-sm text-[#895333] uppercase font-semibold">Optional</span>
                          </div>
                          <div className="relative rounded-xl bg-[#E8DAC9] shadow-[inset_0_3px_5px_rgba(44,24,16,0.22)] p-2">
                            <textarea
                              className="w-full bg-transparent border-0 focus:ring-0 text-[#24140D] font-body-md text-body-md placeholder:text-[#895333]/70 resize-none focus:outline-none leading-relaxed"
                              id="clanDescriptionInput"
                              maxLength={160}
                              name="clanDescription"
                              placeholder="Brief warband manifesto, battle cries, meeting times, or clan rules..."
                              rows={3}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-between items-center px-1">
                            <span className="font-label-sm text-label-sm text-[#895333]">Parchment War Manifesto</span>
                            <span className="font-label-sm text-label-sm text-[#825336] font-bold" id="charCounter">
                              {description.length} / 160
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* RIGHT COLUMN: Avatar & Banner Combined Heraldry Showcase */}
                      <div className="lg:col-span-5 flex flex-col gap-5 bg-[#EBDBC8] p-5 rounded-2xl shadow-[inset_0_2px_5px_rgba(44,24,16,0.18)]">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md text-[#24140D] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#7a5900] text-lg">flag</span>
                            Heraldry Preview
                          </span>
                          <span className="font-label-sm text-label-sm bg-[#f5b823] text-[#674b00] px-2 py-0.5 rounded-full font-extrabold uppercase">
                            Tactical Standard
                          </span>
                        </div>

                        {/* Banner Preview Box with Avatar Floating Overlap */}
                        <div className="relative w-full rounded-xl overflow-hidden shadow-[0_6px_0_#673C21,0_10px_16px_rgba(0,0,0,0.25)] bg-[#2D160C]">
                          {/* 2. Clan Banner Visual Preview */}
                          <div className={`relative h-32 w-full ${currentBanner.class} flex items-center justify-center overflow-hidden`} id="bannerPreview">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F5B823_1px,transparent_1px)] [background-size:16px_16px]" />
                            {/* Banner Crest Watermark */}
                            <div className="flex flex-col items-center justify-center text-center select-none text-[#FBD46E]" id="bannerGraphic">
                              <span className="material-symbols-outlined text-6xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                                {currentBanner.icon}
                              </span>
                              <span className="font-headline-sm text-headline-sm uppercase tracking-widest text-[#FFF2A8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-1" id="bannerTextDisplay">
                                {clanName.trim().toUpperCase() || 'VALHALLA VANGUARD'}
                              </span>
                            </div>
                            {/* Gold Banner Bottom Fringe Ribbon */}
                            <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-[#D4AF37] via-[#FFF2A8] to-[#D4AF37] shadow-sm" />
                          </div>

                          {/* 3. Clan Avatar Shield Emblem Preview Overlap */}
                          <div className="p-3 bg-[#3F2010] flex items-center gap-4">
                            <div className="relative -mt-10 ml-2">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#F5B823] to-[#B28212] p-1 shadow-[0_4px_0_#241208,0_6px_12px_rgba(0,0,0,0.4)] flex items-center justify-center" id="avatarContainer">
                                <div className="w-full h-full rounded-xl bg-gradient-to-b from-[#7A1F1D] to-[#450C0B] flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[#FBD46E] text-3xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" id="avatarIconDisplay">
                                    {currentAvatarIcon}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-headline-sm text-[#FFF2A8] leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" id="previewTitle">
                                {clanName.trim() || 'Valhalla Vanguard'}
                              </span>
                              <span className="font-label-sm text-label-sm text-[#E2C5A5] uppercase font-bold tracking-wider">
                                Standard Bearer Crest
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Heraldry Presets & Pickers */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          {/* 2. Banner Selector */}
                          <div className="flex flex-col gap-1.5">
                            <span className="font-label-sm text-label-sm text-[#24140D] font-bold uppercase">Banner Pattern</span>
                            <div className="grid grid-cols-4 gap-1.5" id="bannerPicker">
                              <button
                                className={`h-9 rounded-lg bg-gradient-to-b from-[#B71C1C] to-[#670B0B] shadow-[0_3px_0_#3A0808] flex items-center justify-center active:translate-y-0.5 cursor-pointer ${bannerPattern === 'crimson-fire' ? '' : 'opacity-80 hover:opacity-100'
                                  }`}
                                data-banner="crimson-fire"
                                title="Crimson Fire"
                                type="button"
                                onClick={() => setBannerPattern('crimson-fire')}
                              >
                                <span className="material-symbols-outlined text-[#FBD46E] text-sm">local_fire_department</span>
                              </button>
                              <button
                                className={`h-9 rounded-lg bg-gradient-to-b from-[#1565C0] to-[#0A2E5C] shadow-[0_3px_0_#061833] flex items-center justify-center active:translate-y-0.5 cursor-pointer ${bannerPattern === 'royal-dragon' ? '' : 'opacity-80 hover:opacity-100'
                                  }`}
                                data-banner="royal-dragon"
                                title="Cobalt Dragon"
                                type="button"
                                onClick={() => setBannerPattern('royal-dragon')}
                              >
                                <span className="material-symbols-outlined text-[#FFF] text-sm">cruelty_free</span>
                              </button>
                              <button
                                className={`h-9 rounded-lg bg-gradient-to-b from-[#C62828] to-[#7F0000] shadow-[0_3px_0_#4A0000] flex items-center justify-center active:translate-y-0.5 cursor-pointer ${bannerPattern === 'emerald-axes' ? '' : 'opacity-80 hover:opacity-100'
                                  }`}
                                data-banner="emerald-axes"
                                title="Verdant Axes"
                                type="button"
                                onClick={() => setBannerPattern('emerald-axes')}
                              >
                                <span className="material-symbols-outlined text-[#FFF] text-sm">swords</span>
                              </button>
                              <button
                                className={`h-9 rounded-lg bg-gradient-to-b from-[#D48806] to-[#784704] shadow-[0_3px_0_#422401] flex items-center justify-center active:translate-y-0.5 cursor-pointer ${bannerPattern === 'golden-lion' ? '' : 'opacity-80 hover:opacity-100'
                                  }`}
                                data-banner="golden-lion"
                                title="Gilded Sun"
                                type="button"
                                onClick={() => setBannerPattern('golden-lion')}
                              >
                                <span className="material-symbols-outlined text-[#FFF] text-sm">wb_sunny</span>
                              </button>
                            </div>
                          </div>

                          {/* 3. Avatar / Shield Emblem Selector */}
                          <div className="flex flex-col gap-1.5">
                            <span className="font-label-sm text-label-sm text-[#24140D] font-bold uppercase">Shield Emblem</span>
                            <div className="grid grid-cols-4 gap-1.5" id="avatarPicker">
                              <button
                                className={`h-9 rounded-lg shadow-[0_3px_0_#2B180D] flex items-center justify-center active:translate-y-0.5 cursor-pointer ${shieldEmblem === 'shield' ? 'bg-[#53301B] shadow-[0_3px_0_#2B180D]' : 'bg-[#3C2314] shadow-[0_3px_0_#1E0F07] hover:bg-[#53301B]'
                                  }`}
                                data-avatar="shield"
                                title="Iron Shield"
                                type="button"
                                onClick={() => setShieldEmblem('shield')}
                              >
                                <span className={`material-symbols-outlined text-sm ${shieldEmblem === 'shield' ? 'text-[#FBD46E]' : 'text-[#E2C5A5]'}`}>shield</span>
                              </button>
                              <button
                                className={`h-9 rounded-lg shadow-[0_3px_0_#1E0F07] flex items-center justify-center active:translate-y-0.5 cursor-pointer ${shieldEmblem === 'skull' ? 'bg-[#53301B] shadow-[0_3px_0_#2B180D]' : 'bg-[#3C2314] shadow-[0_3px_0_#1E0F07] hover:bg-[#53301B]'
                                  }`}
                                data-avatar="skull"
                                title="Viking Skull"
                                type="button"
                                onClick={() => setShieldEmblem('skull')}
                              >
                                <span className={`material-symbols-outlined text-sm ${shieldEmblem === 'skull' ? 'text-[#FBD46E]' : 'text-[#E2C5A5]'}`}>skull</span>
                              </button>
                              <button
                                className={`h-9 rounded-lg shadow-[0_3px_0_#1E0F07] flex items-center justify-center active:translate-y-0.5 cursor-pointer ${shieldEmblem === 'crown' ? 'bg-[#53301B] shadow-[0_3px_0_#2B180D]' : 'bg-[#3C2314] shadow-[0_3px_0_#1E0F07] hover:bg-[#53301B]'
                                  }`}
                                data-avatar="crown"
                                title="Gold Crown"
                                type="button"
                                onClick={() => setShieldEmblem('crown')}
                              >
                                <span className={`material-symbols-outlined text-sm ${shieldEmblem === 'crown' ? 'text-[#FBD46E]' : 'text-[#E2C5A5]'}`}>crown</span>
                              </button>
                              <button
                                className={`h-9 rounded-lg shadow-[0_3px_0_#1E0F07] flex items-center justify-center active:translate-y-0.5 cursor-pointer ${shieldEmblem === 'target' ? 'bg-[#53301B] shadow-[0_3px_0_#2B180D]' : 'bg-[#3C2314] shadow-[0_3px_0_#1E0F07] hover:bg-[#53301B]'
                                  }`}
                                data-avatar="target"
                                title="Archer Target"
                                type="button"
                                onClick={() => setShieldEmblem('target')}
                              >
                                <span className={`material-symbols-outlined text-sm ${shieldEmblem === 'target' ? 'text-[#FBD46E]' : 'text-[#E2C5A5]'}`}>adjust</span>
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* TIMBER DIVIDER PLANK */}
                    <div className="h-3 w-full bg-gradient-to-r from-[#5C321A] via-[#7B4627] to-[#5C321A] rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.25)] flex items-center justify-between px-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F5B823] shadow-sm" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F5B823] shadow-sm" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F5B823] shadow-sm" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F5B823] shadow-sm" />
                    </div>

                    {/* 5. ADD WARRIOR SECTION */}
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#F5B823] to-[#B28212] flex items-center justify-center shadow-[0_3px_0_#5C4200]">
                            <span className="material-symbols-outlined text-[#261900] text-xl">person_add</span>
                          </div>
                          <div>
                            <h3 className="font-headline-sm text-headline-sm text-[#24140D] uppercase tracking-wide">
                              Add Warriors
                            </h3>
                            <span className="font-label-sm text-label-sm text-[#825336] font-bold uppercase tracking-wider">
                              Recruit Initial Clan Comrades
                            </span>
                          </div>
                        </div>

                        {/* Warrior Counter Badge */}
                        <div className="inline-flex items-center gap-2 bg-[#E6D4BF] px-3 py-1.5 rounded-xl shadow-[inset_0_2px_3px_rgba(44,24,16,0.2)]">
                          <span className="material-symbols-outlined text-[#7a5900] text-base">groups</span>
                          <span className="font-label-md text-label-md text-[#24140D] font-extrabold uppercase" id="warriorCountBadge">
                            {selectedWarriors.length} Warrior{selectedWarriors.length === 1 ? '' : 's'} Recruited
                          </span>
                        </div>
                      </div>

                      {/* Recruited Warriors Tray / Chips */}
                      <div className="bg-[#EFE4D6] p-3 rounded-xl shadow-[inset_0_2px_4px_rgba(44,24,16,0.14)]">
                        <span className="font-label-sm text-label-sm text-[#895333] font-bold uppercase tracking-wider block mb-2">
                          Selected Warband Vanguard
                        </span>
                        <div className="flex flex-wrap gap-2.5 min-h-[38px] items-center" id="selectedWarriorsContainer">
                          {selectedWarriors.length === 0 ? (
                            <span className="font-body-sm text-body-sm text-[#895333] italic">
                              No comrades assigned yet. Search and add warriors below.
                            </span>
                          ) : (
                            selectedWarriors.map((warrior) => (
                              <div
                                key={warrior.id}
                                className="inline-flex items-center gap-2 bg-[#F6EFE6] px-2.5 py-1 rounded-lg shadow-[0_2px_0_#825336] animate-fadeIn"
                              >
                                <span className="font-label-sm text-label-sm bg-[#5C321A] text-[#FFF2A8] px-1 rounded font-black">
                                  LVL {warrior.level}
                                </span>
                                <span className="font-headline-sm text-headline-sm text-[#24140D] text-xs font-bold">
                                  {warrior.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeWarrior(warrior.id);
                                  }}
                                  className="text-[#825336] hover:text-[#ba1a1a] flex items-center justify-center p-0.5 rounded focus:outline-none cursor-pointer"
                                  title={`Remove ${warrior.name}`}
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Warrior Search Bar */}
                      <div className="relative rounded-xl bg-[#E8DAC9] shadow-[inset_0_3px_5px_rgba(44,24,16,0.22)] p-1">
                        <div className="flex items-center gap-3 px-3 py-1.5">
                          <span className="material-symbols-outlined text-[#825336] text-2xl">person_search</span>
                          <input
                            className="w-full bg-transparent border-0 focus:ring-0 text-[#24140D] font-body-md text-body-md placeholder:text-[#895333] focus:outline-none"
                            id="warriorSearchInput"
                            placeholder="Search warriors by name or clan tag (e.g. Ahmed, Valkyrie)..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          {searchQuery && (
                            <button
                              className="text-[#895333] hover:text-[#24140D] cursor-pointer"
                              id="clearSearchBtn"
                              type="button"
                              onClick={() => setSearchQuery('')}
                            >
                              <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Search Results / Available Warriors Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="warriorsGrid">
                        {filteredWarriors.length === 0 ? (
                          <div className="col-span-full py-6 text-center text-[#895333] font-label-md">
                            <span className="material-symbols-outlined text-3xl mb-1 text-[#895333]">search_off</span>
                            <p>No warriors found matching &quot;{searchQuery}&quot;.</p>
                          </div>
                        ) : (
                          filteredWarriors.map((warrior) => {
                            const isSelected = warrior.selected;
                            return (
                              <div
                                key={warrior.id}
                                onClick={() => toggleWarrior(warrior.id)}
                                className={`cursor-pointer transition-all p-3 rounded-xl flex items-center justify-between select-none ${isSelected
                                  ? 'bg-[#E5D2BC] shadow-[0_3px_0_#673C21]'
                                  : 'bg-[#F2E7D8] shadow-[0_2px_0_#9E816E] hover:bg-[#EBDDCB]'
                                  }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-10 h-10 rounded-lg ${isSelected ? 'bg-gradient-to-b from-[#F5B823] to-[#B28212]' : 'bg-[#D7C4AF]'} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <span className="material-symbols-outlined text-[#261900] text-xl">{warrior.avatar}</span>
                                  </div>
                                  <div className="flex flex-col truncate">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-headline-sm text-headline-sm text-[#24140D] truncate">{warrior.name}</span>
                                      <span className="font-label-sm text-label-sm bg-[#3C2314] text-[#FBD46E] px-1.5 py-0.2 rounded font-extrabold">LVL {warrior.level}</span>
                                    </div>
                                    <span className="font-label-sm text-label-sm text-[#825336] font-semibold">{warrior.tag}</span>
                                  </div>
                                </div>

                                <div className={`w-7 h-7 rounded-lg ${isSelected ? 'bg-[#C62828] text-white shadow-[0_2px_0_#7F0000]' : 'bg-[#D2BEA9] text-transparent shadow-[inset_0_2px_2px_rgba(0,0,0,0.2)]'} flex items-center justify-center transition-all flex-shrink-0 ml-2`}>
                                  <span className="material-symbols-outlined text-base font-bold">{isSelected ? 'check' : 'add'}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                    </div>

                    {/* 6. CREATE CLAN PRIMARY ACTION BUTTON */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-[#6E4C38]">
                        <span className="material-symbols-outlined text-[#7a5900] text-lg">info</span>
                        <span className="font-body-sm text-body-sm">
                          Clan heraldry, badge, and war roster will be initialized immediately in the war room.
                        </span>
                      </div>
                      <button
                        className="w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-2xl bg-gradient-to-b from-[#EF5350] via-[#E53935] to-[#C62828] text-white shadow-[0_6px_0_#7F0000,0_10px_18px_rgba(186,26,26,0.45)] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_#7F0000] transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-60"
                        id="forgeClanButton"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        <span className="material-symbols-outlined text-[#FFF2A8] text-2xl group-hover:rotate-12 transition-transform">swords</span>
                        <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] font-extrabold">
                          {isSubmitting ? 'Forging Clan...' : '⚔️ Forge Clan'}
                        </span>
                        <span className="material-symbols-outlined text-[#FFF2A8] text-2xl group-hover:-rotate-12 transition-transform">bolt</span>
                      </button>
                    </div>

                  </form>
                </div>
              </div>

              {/* Success Feedback Banner */}
              {showToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#B71C1C] text-white px-6 py-4 rounded-2xl shadow-[0_6px_0_#7F0000,0_12px_24px_rgba(0,0,0,0.4)] flex items-center gap-3 animate-bounce" id="creationToast">
                  <span className="material-symbols-outlined text-3xl text-[#FFF]">verified</span>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm uppercase">Clan Forged in Honor!</h4>
                    <p className="font-body-sm text-body-sm">The war room gates have opened for your comrades.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full bg-[#3C2314] border-t-4 border-[#C89437] py-4 text-center md:text-left">
          <div className="w-full px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FBD46E] text-lg">swords</span>
              <span className="font-label-md text-label-md text-[#E8CDB2] uppercase tracking-wider font-extrabold">
                CLASH TACTICAL CHAT PROTOCOL • FORGED FOR MID-CORE VICTORY
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-label-sm text-label-sm text-[#C8A688] uppercase font-bold">SERVER REGION: N.VALLEY [OPTIMAL 14MS]</span>
              <span className="font-label-sm text-label-sm text-[#C8A688] uppercase font-bold">© 2024 CLASH WAR THEATRE</span>
            </div>
          </div>
        </footer>
      </div>
    </AuthProtected>
  );
}
