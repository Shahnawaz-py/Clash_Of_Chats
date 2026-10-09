"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/NavigationHeader';
import { AuthProtected } from '@/components/AuthProtected';
import { userApi, clanApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { sfx } from '@/lib/sfx';
import { BannerCropperModal } from '@/components/BannerCropperModal';

interface WarriorItem {
  id: string;
  name: string;
  handle: string;
  tag: string;
  level: number;
  avatar: string;
  selected: boolean;
}

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

const BANNER_FILTERS: Record<string, { id: string; name: string; filterStyle: string }> = {
  none: { id: 'none', name: 'Vivid Original', filterStyle: 'none' },
  dark: { id: 'dark', name: 'Dark Citadel Shadow', filterStyle: 'contrast(125%) brightness(70%)' },
  golden: { id: 'golden', name: 'Golden Sunburst', filterStyle: 'sepia(35%) saturate(160%) hue-rotate(-15deg)' },
  dramatic: { id: 'dramatic', name: 'Warfront Intensity', filterStyle: 'contrast(140%) saturate(140%)' },
  sepia: { id: 'sepia', name: 'Ancient Scroll', filterStyle: 'sepia(70%) contrast(110%)' },
  blur: { id: 'blur', name: 'Mystic Fog', filterStyle: 'blur(3px) brightness(90%)' },
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

  const [clanName, setClanName] = useState('');
  const [description, setDescription] = useState(
    'Brave warriors defending the northern fortress. Active daily in war raids and tactical skirmishes. Always donate before asking!'
  );

  // Avatar & Banner Customization States (matching profile settings)
  const [selectedAvatar, setSelectedAvatar] = useState('bk');
  const [tempAvatar, setTempAvatar] = useState('bk');
  const [selectedBanner, setSelectedBanner] = useState('arena');
  const [tempBanner, setTempBanner] = useState('arena');

  const [bannerUrl, setBannerUrl] = useState('');
  const [tempBannerUrl, setTempBannerUrl] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [tempBannerTitle, setTempBannerTitle] = useState('');
  const [bannerFilter, setBannerFilter] = useState('none');
  const [tempBannerFilter, setTempBannerFilter] = useState('none');
  const [bannerModalTab, setBannerModalTab] = useState<'preset' | 'edit'>('preset');

  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

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
    sfx.playClick();
    setWarriors((prev) =>
      prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w))
    );
  };

  const removeWarrior = (id: string) => {
    sfx.playClick();
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

  const confirmAvatarSelection = () => {
    sfx.playClanReward();
    setSelectedAvatar(tempAvatar);
    setIsAvatarModalOpen(false);
  };

  const confirmBannerSelection = () => {
    sfx.playClanReward();
    setSelectedBanner(tempBanner);
    setBannerUrl(tempBannerUrl);
    setBannerTitle(tempBannerTitle);
    setBannerFilter(tempBannerFilter);
    setIsBannerModalOpen(false);
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage('Image size must be under 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const rawUrl = event.target.result as string;
          setCropperImageSrc(rawUrl);
          setIsCropperOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleForgeClan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clanName.trim()) {
      setErrorMessage('Please enter a clan name before forging!');
      sfx.playError();
      return;
    }

    try {
      sfx.playClick();
      setIsSubmitting(true);
      const memberIds = selectedWarriors.map((w) => w.id);

      const createdClan = await clanApi.createClan({
        name: clanName.trim(),
        description: description.trim(),
        bannerPattern: selectedBanner,
        shieldEmblem: selectedAvatar,
        avatar: selectedAvatar,
        bannerUrl,
        bannerTitle,
        bannerFilter,
        memberIds,
      });

      sfx.playClanReward();
      setShowToast(true);

      setTimeout(() => {
        if (createdClan && createdClan._id) {
          router.push(`/chats?clanId=${createdClan._id}`);
        } else {
          router.push('/chats');
        }
      }, 2500);
    } catch (err: any) {
      console.warn('[Create Clan Warning]', err?.message || err);
      sfx.playError();
      setErrorMessage(err.message || 'Failed to forge clan. Please try again.');
      setIsSubmitting(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const currentAvatarObj = AVATAR_PRESETS.find((a) => a.id === selectedAvatar) || AVATAR_PRESETS[0];
  const currentBannerObj = BANNER_PRESETS.find((b) => b.id === selectedBanner) || BANNER_PRESETS[0];

  const activeBannerImgUrl = bannerUrl || currentBannerObj.img;
  const activeBannerFilterStyle = BANNER_FILTERS[bannerFilter]?.filterStyle || 'none';

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
                      <div className="p-4 rounded-xl bg-[#7F0000] border-2 border-[#EF5350] text-[#FFCDD2] shadow-[0_4px_12px_rgba(127,0,0,0.5)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-headShake">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#FFCDD2] text-2xl font-bold">warning</span>
                          <span className="font-headline-sm text-headline-sm text-white tracking-wide">{errorMessage}</span>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {errorMessage.includes('exists') && (
                            <button
                              type="button"
                              onClick={() => {
                                sfx.playClick();
                                const base = clanName.trim() || 'Valhalla Vanguard';
                                const suffix = Math.floor(10 + Math.random() * 90);
                                setClanName(`${base.slice(0, 20)} ${suffix}`);
                                setErrorMessage(null);
                              }}
                              className="px-3 py-1 rounded-lg bg-[#F5B823] text-[#3F2010] font-label-sm text-xs uppercase font-black hover:bg-[#FCE182] transition-colors cursor-pointer shadow-sm"
                            >
                              Auto-Rename
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setErrorMessage(null)}
                            className="text-[#FFCDD2] hover:text-white transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xl">close</span>
                          </button>
                        </div>
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

                        {/* Clan Description Textarea */}
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

                      {/* RIGHT COLUMN: Avatar & Banner Stitch Heraldry Showcase */}
                      <div className="lg:col-span-5 flex flex-col gap-4 bg-[#EBDBC8] p-5 rounded-2xl shadow-[inset_0_2px_5px_rgba(44,24,16,0.18)]">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md text-[#24140D] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#7a5900] text-lg">flag</span>
                            Heraldry Preview
                          </span>
                          <span className="font-label-sm text-label-sm bg-[#f5b823] text-[#674b00] px-2 py-0.5 rounded-full font-extrabold uppercase">
                            Tactical Standard
                          </span>
                        </div>

                        {/* Banner Card Preview Box with Overlapping Avatar */}
                        <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_6px_0_#673C21,0_10px_16px_rgba(0,0,0,0.25)] bg-[#2D160C] border-2 border-[#895333]">
                          {/* Banner Visual Canvas */}
                          <div className="relative h-36 w-full bg-[#EFE0CE] overflow-hidden group">
                            <img
                              src={activeBannerImgUrl}
                              alt={currentBannerObj.name}
                              style={{ filter: activeBannerFilterStyle }}
                              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                            {bannerTitle ? (
                              <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center pointer-events-none">
                                <div className="px-2.5 py-1 rounded-xl bg-[#2B180D]/85 backdrop-blur-md border border-[#C89437] flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[#FBD46E] text-sm font-black">shield</span>
                                  <span className="font-headline-sm text-xs text-[#FBD46E] uppercase font-black tracking-wider drop-shadow-md truncate">
                                    {bannerTitle}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="absolute bottom-2.5 left-3 z-10 flex items-center pointer-events-none">
                                <span className="font-headline-sm text-xs uppercase tracking-widest text-[#FFF2A8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-black">
                                  {clanName.trim().toUpperCase() || 'VALHALLA VANGUARD'}
                                </span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                sfx.playClick();
                                setTempBanner(selectedBanner);
                                setTempBannerUrl(bannerUrl);
                                setTempBannerTitle(bannerTitle);
                                setTempBannerFilter(bannerFilter);
                                setBannerModalTab('preset');
                                setIsBannerModalOpen(true);
                              }}
                              className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FFFDF9]/90 backdrop-blur-md text-[#3E2415] border border-[#CDB194] font-label-sm text-[11px] uppercase tracking-wider hover:bg-[#FFFFFF] transition-all shadow-md font-black cursor-pointer z-10"
                            >
                              <span className="material-symbols-outlined text-[#895333] text-sm">photo_camera</span>
                              <span>Change Banner</span>
                            </button>
                          </div>

                          {/* Overlapping Hero Avatar & Clan Title Badge */}
                          <div className="p-3 bg-[#3F2010] flex items-center gap-3.5">
                            <div className="relative -mt-9 ml-1">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#FAF3E8] border-2 border-[#FFFDF9] ring-2 ring-[#C89437] shadow-[0_4px_10px_rgba(0,0,0,0.4)] relative">
                                <img
                                  src={currentAvatarObj.img}
                                  alt={currentAvatarObj.name}
                                  className="w-full h-full object-cover object-center"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  sfx.playClick();
                                  setTempAvatar(selectedAvatar);
                                  setIsAvatarModalOpen(true);
                                }}
                                aria-label="Change Avatar"
                                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-b from-[#FCE58D] to-[#E9B634] text-[#4A2F08] border border-[#B8861B] flex items-center justify-center shadow-md hover:brightness-105 transition-all hover:scale-105 cursor-pointer z-10"
                              >
                                <span className="material-symbols-outlined text-sm font-bold">photo_camera</span>
                              </button>
                            </div>

                            <div className="flex flex-col min-w-0">
                              <span className="font-headline-sm text-sm text-[#FFF2A8] leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-black truncate">
                                {clanName.trim() || 'Valhalla Vanguard'}
                              </span>
                              <span className="font-label-sm text-[11px] text-[#E2C5A5] uppercase font-bold tracking-wider">
                                {currentAvatarObj.name} Crest
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Avatar & Banner Selection Controls */}
                        <div className="grid grid-cols-1 gap-2.5 pt-1">
                          {/* Quick Avatar Picker Box */}
                          <div className="p-3 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={currentAvatarObj.img}
                                alt={currentAvatarObj.name}
                                className="w-10 h-10 rounded-full object-cover bg-[#EFE0CE] ring-2 ring-[#D4A359]"
                              />
                              <div>
                                <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold">Clan Hero Avatar</span>
                                <div className="font-label-md text-xs text-[#24140D] font-black">{currentAvatarObj.name}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                sfx.playClick();
                                setTempAvatar(selectedAvatar);
                                setIsAvatarModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4E8D8] border border-[#CDB194] border-b-2 border-b-[#987654] hover:bg-[#FFF9EE] text-[#5C381E] font-label-md text-xs uppercase tracking-wider font-black shadow-sm active:translate-y-0.5 cursor-pointer"
                            >
                              Select
                            </button>
                          </div>

                          {/* Quick Banner Picker Box */}
                          <div className="p-3 rounded-xl bg-[#FAF5ED] border border-[#E7D6C3] flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-12 h-8 rounded-lg overflow-hidden bg-[#EFE0CE] border border-[#D4A359] relative flex-shrink-0">
                                <img
                                  src={activeBannerImgUrl}
                                  alt={currentBannerObj.name}
                                  style={{ filter: activeBannerFilterStyle }}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="font-label-sm text-[10px] text-[#8A6348] uppercase font-bold">War Canvas Studio</span>
                                <div className="font-label-md text-xs text-[#24140D] font-black truncate">
                                  {bannerTitle ? `${currentBannerObj.name} • "${bannerTitle}"` : currentBannerObj.name}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                sfx.playClick();
                                setTempBanner(selectedBanner);
                                setTempBannerUrl(bannerUrl);
                                setTempBannerTitle(bannerTitle);
                                setTempBannerFilter(bannerFilter);
                                setBannerModalTab('preset');
                                setIsBannerModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4E8D8] border border-[#CDB194] border-b-2 border-b-[#987654] hover:bg-[#FFF9EE] text-[#5C381E] font-label-md text-xs uppercase tracking-wider font-black shadow-sm active:translate-y-0.5 cursor-pointer"
                            >
                              Change
                            </button>
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

        {/* MODAL 1: SELECT CLAN HERO AVATAR */}
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-xl bg-[#FFFDF9] rounded-3xl shadow-[0_16px_50px_rgba(89,53,28,0.3)] overflow-hidden flex flex-col border-4 border-[#C89437]">
              <div className="px-6 py-4 bg-[#FAF5ED] flex items-center justify-between border-b-2 border-[#895333]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#895333] text-xl">military_tech</span>
                  <h3 className="font-headline-sm text-base text-[#3E2415] uppercase font-black">Select Clan Hero Avatar</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#EFE0CE] hover:bg-[#E5D2BC] flex items-center justify-center text-[#5C381E] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4 bg-[#FAF3E8]">
                <p className="font-body-sm text-xs text-[#6E4C38]">
                  Choose your clan hero avatar icon to represent your legion standard in battle rosters and war room chats.
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
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[#6E4C38] hover:text-[#24140D] font-label-md text-xs uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAvatarSelection}
                  className="px-5 py-2 rounded-xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] text-[#412708] border-b-2 border-[#A8740B] font-label-md text-xs uppercase shadow-sm active:translate-y-0.5 font-black cursor-pointer"
                >
                  Confirm Avatar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: WAR BANNER STUDIO */}
        {isBannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-2xl bg-[#FFFDF9] rounded-3xl shadow-[0_16px_50px_rgba(89,53,28,0.3)] overflow-hidden flex flex-col border-4 border-[#C89437]">
              {/* Header with Mode Tabs */}
              <div className="px-6 py-4 bg-[#FAF5ED] border-b-2 border-[#895333]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#895333] text-xl">wallpaper</span>
                    <h3 className="font-headline-sm text-base text-[#3E2415] uppercase font-black">War Banner Studio</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(false)}
                    className="w-8 h-8 rounded-lg bg-[#EFE0CE] hover:bg-[#E5D2BC] flex items-center justify-center text-[#5C381E] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mt-3 p-1 rounded-xl bg-[#EFE0CE] border border-[#D8C2AA]">
                  <button
                    type="button"
                    onClick={() => { sfx.playClick(); setBannerModalTab('preset'); }}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-label-md text-xs uppercase font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${bannerModalTab === 'preset'
                      ? 'bg-[#FFFDF9] text-[#3E2415] shadow-sm border border-[#C89437]'
                      : 'text-[#7D583F] hover:text-[#3E2415]'
                      }`}
                  >
                    <span className="material-symbols-outlined text-sm">photo_library</span>
                    <span>Scenic Presets</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { sfx.playClick(); setBannerModalTab('edit'); }}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-label-md text-xs uppercase font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${bannerModalTab === 'edit'
                      ? 'bg-[#FCE182] text-[#412708] shadow-sm border border-[#A8740B]'
                      : 'text-[#7D583F] hover:text-[#3E2415]'
                      }`}
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit Banner Options</span>
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto bg-[#FAF3E8]">

                {/* Live Banner Preview Block */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-[11px] text-[#895333] uppercase font-black">Live Banner Preview</span>
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        const currentImg = tempBannerUrl || (BANNER_PRESETS.find(b => b.id === tempBanner)?.img || BANNER_PRESETS[0].img);
                        setCropperImageSrc(currentImg);
                        setIsCropperOpen(true);
                      }}
                      className="px-3 py-1 rounded-xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] text-[#412708] border border-[#A8740B] font-label-md text-xs uppercase font-black shadow-xs hover:brightness-105 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">crop</span>
                      <span>Crop & Position (4:1)</span>
                    </button>
                  </div>
                  <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-[#EFE0CE] border-2 border-[#C89437] shadow-inner">
                    <img
                      src={tempBannerUrl || (BANNER_PRESETS.find(b => b.id === tempBanner)?.img || BANNER_PRESETS[0].img)}
                      alt="Banner Preview"
                      style={{ filter: BANNER_FILTERS[tempBannerFilter]?.filterStyle || 'none' }}
                      className="w-full h-full object-cover object-center transition-all"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                    {tempBannerTitle && (
                      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center pointer-events-none">
                        <div className="px-3 py-1.5 rounded-xl bg-[#2B180D]/85 backdrop-blur-md border border-[#C89437] flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#FBD46E] text-base font-black">shield</span>
                          <span className="font-headline-sm text-xs sm:text-sm text-[#FBD46E] uppercase font-black tracking-wider drop-shadow-md">
                            {tempBannerTitle}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {bannerModalTab === 'preset' ? (
                  <>
                    <p className="font-body-sm text-xs text-[#6E4C38]">
                      Select a legendary scenic banner preset to display atop your clan standard:
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
                          <div className="w-full h-24 rounded-lg overflow-hidden bg-[#EFE0CE]">
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

                    <div className="pt-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setBannerModalTab('edit')}
                        className="px-4 py-2 rounded-xl bg-[#EFE0CE] hover:bg-[#E5D2BC] text-[#5C381E] font-label-md text-xs uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#CDB194]"
                      >
                        <span className="material-symbols-outlined text-sm">tune</span>
                        <span>Customize Banner Title, Image & Filters</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* EDIT BANNER CUSTOMIZATION TAB */
                  <div className="flex flex-col gap-5">

                    {/* 1. Image Source & Upload */}
                    <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E7D6C3]">
                      <label className="font-label-sm text-xs text-[#5B3317] uppercase font-black flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#895333]">add_photo_alternate</span>
                        <span>Custom Banner Image Source</span>
                      </label>

                      <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <label className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-b from-[#F5B823] to-[#B28212] text-[#3E2207] font-headline-sm text-xs font-black uppercase shadow-sm hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0">
                          <span className="material-symbols-outlined text-sm">upload_file</span>
                          <span>Upload Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerFileUpload}
                            className="hidden"
                          />
                        </label>

                        <input
                          type="url"
                          value={tempBannerUrl}
                          onChange={(e) => setTempBannerUrl(e.target.value)}
                          placeholder="Or paste custom banner image URL (https://...)"
                          className="w-full bg-[#FFFDF6] border border-[#CDB194] rounded-xl px-3 py-2 font-body-sm text-xs text-[#24140D] focus:outline-none focus:border-[#C88421]"
                        />

                        {tempBannerUrl && (
                          <button
                            type="button"
                            onClick={() => setTempBannerUrl('')}
                            className="px-3 py-2 rounded-xl bg-[#FEECEC] text-[#B71C1C] hover:bg-[#FCD8D8] font-label-sm text-xs font-bold shrink-0 cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2. Custom Banner Title Overlay */}
                    <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E7D6C3]">
                      <label className="font-label-sm text-xs text-[#5B3317] uppercase font-black flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#895333]">title</span>
                        <span>Banner Title & War Slogan Overlay</span>
                      </label>
                      <input
                        type="text"
                        value={tempBannerTitle}
                        onChange={(e) => setTempBannerTitle(e.target.value)}
                        placeholder="e.g. VALKYRIE CITADEL / UNSTOPPABLE WARRIORS"
                        maxLength={40}
                        className="w-full bg-[#FFFDF6] border border-[#CDB194] rounded-xl px-3 py-2 font-body-sm text-xs text-[#24140D] focus:outline-none focus:border-[#C88421] font-bold"
                      />
                      <span className="font-label-sm text-[10px] text-[#8A6348]">
                        Adds a golden heraldic badge overlay to your war banner display.
                      </span>
                    </div>

                    {/* 3. Banner Filters & Visual Effects */}
                    <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E7D6C3]">
                      <label className="font-label-sm text-xs text-[#5B3317] uppercase font-black flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#895333]">auto_fix_high</span>
                        <span>Select Banner Filter Effect</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.values(BANNER_FILTERS).map((flt) => {
                          const isSelected = tempBannerFilter === flt.id;
                          return (
                            <button
                              key={flt.id}
                              type="button"
                              onClick={() => {
                                sfx.playClick();
                                setTempBannerFilter(flt.id);
                              }}
                              className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer flex items-center justify-between ${isSelected
                                ? 'bg-[#FFF2D7] border-[#C89437] ring-1 ring-[#F5B823] text-[#3E2415]'
                                : 'bg-[#FAF5ED] border-[#E5D2BF] text-[#6E4C38] hover:bg-[#FFFDF9]'
                                }`}
                            >
                              <span className="font-label-sm text-xs font-bold">{flt.name}</span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-sm text-[#C89437]">check_circle</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[#FAF5ED] flex items-center justify-end gap-3 border-t-2 border-[#895333]">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[#6E4C38] hover:text-[#24140D] font-label-md text-xs uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmBannerSelection}
                  className="px-6 py-2 rounded-xl bg-gradient-to-b from-[#FCE182] to-[#E9AE26] text-[#412708] border-b-2 border-[#A8740B] font-label-md text-xs uppercase shadow-sm active:translate-y-0.5 font-black cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  <span>Apply War Banner & Edits</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: INTERACTIVE BANNER CROPPER (4:1 RATIO) */}
        <BannerCropperModal
          isOpen={isCropperOpen}
          imageSrc={cropperImageSrc}
          onClose={() => setIsCropperOpen(false)}
          onSave={(croppedUrl) => {
            setTempBannerUrl(croppedUrl);
            setIsCropperOpen(false);
          }}
        />

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
