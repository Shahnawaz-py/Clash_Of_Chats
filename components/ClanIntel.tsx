"use client";

import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { sfx } from '@/lib/sfx';
import { WallpaperCropperModal } from '@/components/WallpaperCropperModal';

interface ClanIntelProps {
  recipient: UserProfile | null;
}

const CHAT_WALLPAPERS = [
  // Existing Wallpapers
  { id: 'default', name: 'Default Parchment', img: 'default' },
  { id: 'legendary', name: 'Legendary League', img: '/banners/legendary-league.png' },
  { id: 'warfront', name: 'War Battlefield', img: '/banners/war-battlefield.png' },
  { id: 'dark', name: 'Dark Fortress', img: '/banners/dark-fortress.png' },
  { id: 'village', name: 'Daytime Village', img: '/banners/daytime-village.png' },
  { id: 'kingdom', name: 'Epic Kingdom', img: '/banners/epic-kingdom.png' },
  { id: 'cloud', name: 'CoC Citadel', img: '/images/coc-cloud.png' },

  // New Stitch Design Wallpapers
  { id: 'stitch_1', name: 'Stitch War Arena 1', img: '/wallpapers/stitch_wallpaper_1.png' },
  { id: 'stitch_2', name: 'Stitch War Arena 2', img: '/wallpapers/stitch_wallpaper_2.png' },
  { id: 'stitch_3', name: 'Stitch Clash Fortress', img: '/wallpapers/stitch_wallpaper_3.png' },
  { id: 'stitch_4', name: 'Stitch Citadel Night', img: '/wallpapers/stitch_wallpaper_4.png' },
  { id: 'stitch_5', name: 'Stitch Barbarian Hold', img: '/wallpapers/stitch_wallpaper_5.png' },
  { id: 'stitch_6', name: 'Stitch Epic Realm 1', img: '/wallpapers/stitch_wallpaper_6.png' },
  { id: 'stitch_7', name: 'Stitch Epic Realm 2', img: '/wallpapers/stitch_wallpaper_7.png' },
  { id: 'stitch_8', name: 'Stitch Gold Citadel', img: '/wallpapers/stitch_wallpaper_8.png' },
  { id: 'stitch_9', name: 'Stitch Clash Valley', img: '/wallpapers/stitch_wallpaper_9.png' },
];

export const ClanIntel: React.FC<ClanIntelProps> = () => {
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>('default');
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(null);

  // Cropper Modal state
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coc_chat_wallpaper') || 'default';
      const customSaved = localStorage.getItem('coc_custom_chat_wallpaper') || null;
      setSelectedWallpaper(saved);
      if (customSaved) {
        setCustomWallpaper(customSaved);
      }
    }
  }, []);

  const handleSelectWallpaper = (wpImg: string) => {
    sfx.playClick();
    setSelectedWallpaper(wpImg);
    if (typeof window !== 'undefined') {
      localStorage.setItem('coc_chat_wallpaper', wpImg);
      window.dispatchEvent(new CustomEvent('coc_wallpaper_change', { detail: wpImg }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sfx.playClick();
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCropperImageSrc(result);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCroppedWallpaper = (croppedDataUrl: string) => {
    sfx.playClanReward();
    setCustomWallpaper(croppedDataUrl);
    setSelectedWallpaper(croppedDataUrl);
    if (typeof window !== 'undefined') {
      localStorage.setItem('coc_custom_chat_wallpaper', croppedDataUrl);
      localStorage.setItem('coc_chat_wallpaper', croppedDataUrl);
      window.dispatchEvent(new CustomEvent('coc_wallpaper_change', { detail: croppedDataUrl }));
    }
    setIsCropperOpen(false);
  };

  const activeWpName =
    selectedWallpaper === customWallpaper
      ? 'Custom Wallpaper'
      : CHAT_WALLPAPERS.find((w) => w.img === selectedWallpaper)?.name || 'Custom';

  return (
    <aside className="w-full lg:w-[320px] xl:w-[350px] flex-shrink-0 flex flex-col h-full overflow-hidden pr-1">

      {/* TALL CHAT UI WALLPAPER SELECTOR CARD */}
      <div className="w-full h-full bg-[#FFFDF9] border-2 border-[#895333] p-4 rounded-2xl shadow-[0_6px_18px_rgba(89,53,28,0.14)] flex flex-col gap-3.5 overflow-hidden flex-1">

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-sm text-[#3E2415] uppercase tracking-wider font-extrabold flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-[#895333]">wallpaper</span>
            CHAT UI WALLPAPER
          </span>

          <label className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#F5B823] to-[#B28212] text-[#3E2207] font-headline-sm text-xs font-black uppercase cursor-pointer flex items-center gap-1.5 shadow-xs hover:brightness-105 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm">upload</span>
            <span>+ CUSTOM</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Active Wallpaper Info Banner */}
        <div className="px-3.5 py-2 bg-[#FAF3E8] border border-[#DFCAAE] rounded-xl flex items-center justify-between shadow-xs">
          <span className="font-label-sm text-xs text-[#6E4C38] uppercase font-extrabold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#C88421]">palette</span>
            <span>Active Wallpaper:</span>
          </span>
          <span className="font-headline-sm text-xs text-[#3E2415] font-black uppercase tracking-wider truncate max-w-[150px]">
            {activeWpName}
          </span>
        </div>

        {/* Tall Scrollable Thumbnail Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 p-2 bg-[#FAF5ED] rounded-xl border border-[#E7D6C3] pr-1">

          {/* Custom Uploaded Wallpaper Tile */}
          {customWallpaper && (
            <div className="relative group">
              <button
                type="button"
                onClick={() => handleSelectWallpaper(customWallpaper)}
                title="Your Custom Uploaded Wallpaper"
                className={`relative w-full h-28 sm:h-32 rounded-xl overflow-hidden border-3 transition-all cursor-pointer flex flex-col justify-end p-2 text-left ${
                  selectedWallpaper === customWallpaper
                    ? 'border-[#F5B823] ring-2 ring-[#F5B823] scale-102 shadow-lg z-10'
                    : 'border-[#D9C4AE] hover:border-[#895333] hover:scale-101 opacity-90 hover:opacity-100'
                }`}
              >
                <img src={customWallpaper} alt="Custom Wallpaper" className="absolute inset-0 w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                <span className="relative z-10 font-headline-sm text-[11px] text-[#FFE8C2] font-black uppercase truncate drop-shadow-md">
                  Custom Upload
                </span>

                {selectedWallpaper === customWallpaper && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[0.5px]">
                    <span className="material-symbols-outlined text-white text-2xl font-black drop-shadow-md">
                      check_circle
                    </span>
                  </div>
                )}
              </button>

              {/* Edit / Crop button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sfx.playClick();
                  setCropperImageSrc(customWallpaper);
                  setIsCropperOpen(true);
                }}
                className="absolute top-1.5 right-1.5 z-20 w-6 h-6 rounded-full bg-black/80 hover:bg-black text-[#FBD46E] flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                title="Edit / Crop Custom Wallpaper"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
              </button>
            </div>
          )}

          {CHAT_WALLPAPERS.map((wp) => {
            const isSelected = selectedWallpaper === wp.img;
            return (
              <button
                key={wp.id}
                type="button"
                onClick={() => handleSelectWallpaper(wp.img)}
                title={wp.name}
                className={`relative w-full h-28 sm:h-32 rounded-xl overflow-hidden border-3 transition-all cursor-pointer flex flex-col justify-end p-2 text-left ${
                  isSelected
                    ? 'border-[#F5B823] ring-2 ring-[#F5B823] scale-102 shadow-lg z-10'
                    : 'border-[#D9C4AE] hover:border-[#895333] hover:scale-101 opacity-90 hover:opacity-100'
                }`}
              >
                {wp.img === 'default' ? (
                  <div className="absolute inset-0 bg-[#FBF7F0] flex items-center justify-center">
                    <span className="font-headline-sm text-xs font-black text-[#895333] italic">
                      Default Parchment
                    </span>
                  </div>
                ) : (
                  <>
                    <img src={wp.img} alt={wp.name} className="absolute inset-0 w-full h-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                    <span className="relative z-10 font-headline-sm text-[11px] text-[#FFE8C2] font-black uppercase truncate drop-shadow-md">
                      {wp.name}
                    </span>
                  </>
                )}

                {isSelected && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[0.5px]">
                    <span className="material-symbols-outlined text-white text-2xl font-black drop-shadow-md">
                      check_circle
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* WALLPAPER CROPPER MODAL */}
      <WallpaperCropperModal
        isOpen={isCropperOpen}
        imageSrc={cropperImageSrc}
        onClose={() => setIsCropperOpen(false)}
        onSave={handleSaveCroppedWallpaper}
      />

    </aside>
  );
};
