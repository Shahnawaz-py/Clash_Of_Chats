"use client";

import React, { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { sfx } from '@/lib/sfx';
import { BannerCropperModal } from '@/components/BannerCropperModal';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'Chieftain', name: 'Barbarian Chieftain', icon: 'shield' },
  { id: 'Archer', name: 'Master Archer', icon: 'adjust' },
  { id: 'Wizard', name: 'Grand Wizard', icon: 'auto_awesome' },
  { id: 'Pekka', name: 'PEKKA Overlord', icon: 'sports_mma' },
  { id: 'Dragon', name: 'Electro Dragon', icon: 'local_fire_department' },
  { id: 'King', name: 'Barbarian King', icon: 'crown' },
  { id: 'Queen', name: 'Archer Queen', icon: 'female' },
  { id: 'Skull', name: 'Shadow Warrior', icon: 'skull' },
];

const BANNER_PATTERNS = [
  { id: 'crimson-fire', name: 'Crimson Fire', class: 'bg-gradient-to-r from-[#8B1E1E] via-[#B71C1C] to-[#8B1E1E]' },
  { id: 'royal-dragon', name: 'Royal Dragon', class: 'bg-gradient-to-r from-[#0F3868] via-[#1565C0] to-[#0F3868]' },
  { id: 'emerald-axes', name: 'Emerald Axes', class: 'bg-gradient-to-r from-[#7F0000] via-[#C62828] to-[#7F0000]' },
  { id: 'golden-lion', name: 'Golden Lion', class: 'bg-gradient-to-r from-[#6A3F03] via-[#D48806] to-[#6A3F03]' },
];

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('Chieftain');
  const [avatarName, setAvatarName] = useState('Barbarian Chieftain');
  const [bannerPattern, setBannerPattern] = useState('crimson-fire');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerFilter, setBannerFilter] = useState('none');
  const [showEditBannerOptions, setShowEditBannerOptions] = useState(false);
  const [description, setDescription] = useState('');

  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatar(user.avatar || 'Chieftain');
      setAvatarName(user.avatarName || 'Barbarian Chieftain');
      setBannerPattern(user.bannerPattern || 'crimson-fire');
      setBannerUrl(user.bannerUrl || '');
      setBannerTitle(user.bannerTitle || '');
      setBannerFilter(user.bannerFilter || 'none');
      setDescription(user.description || 'Fearless Clash warrior ready for battle.');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setStatusMessage('⚠️ Image file size must be less than 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const rawUrl = event.target.result as string;
          setCropperImageSrc(rawUrl);
          setIsCropperOpen(true);
          setStatusMessage('📸 Image loaded! Crop & position your war banner.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setLoading(true);
      setStatusMessage(null);

      const updatedData = await userApi.updateProfile({
        username: username.trim(),
        avatar,
        avatarName,
        bannerPattern,
        bannerUrl,
        bannerTitle,
        bannerFilter,
        description: description.trim(),
      });

      updateUser(updatedData);
      sfx.playClanReward();
      setStatusMessage('⚔️ Warrior Profile & Banner Updated Successfully!');

      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      sfx.playError();
      setStatusMessage(`⚠️ ${err.message || 'Failed to update settings'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#FFFDF9] border-4 border-[#C89437] rounded-3xl overflow-hidden flex flex-col shadow-[0_16px_50px_rgba(0,0,0,0.6)]">

        {/* Header Banner */}
        <div className="bg-[#3C2314] px-6 py-4 border-b-4 border-[#C89437] flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#53301B] border-2 border-[#C89437] flex items-center justify-center text-[#FBD46E] shadow-inner">
              <span className="material-symbols-outlined text-2xl font-black">settings</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-black uppercase text-[#FBD46E] tracking-wider">
                WARRIOR SETTINGS
              </h2>
              <p className="font-label-sm text-label-sm text-[#E2C5A5] uppercase font-bold tracking-widest">
                Customize Avatar, Banner & Profile Dispatches
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { sfx.playClick(); onClose(); }}
            className="w-9 h-9 rounded-xl bg-[#53301B] hover:bg-[#683C22] border-2 border-[#7A4B2E] text-[#FBD46E] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl font-bold">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveSettings} className="p-6 flex flex-col gap-5 bg-[#FAF3E8] max-h-[80vh] overflow-y-auto">

          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-[#FDF2DB] border-2 border-[#C88421] text-[#3E2415] font-label-md font-bold text-center text-sm shadow-sm animate-pulse">
              {statusMessage}
            </div>
          )}

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-[#5B3317] uppercase font-black">
              WARRIOR NAME (USERNAME)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your warrior handle..."
              className="w-full bg-[#FFFDF6] border-2 border-[#895333] rounded-xl px-4 py-2.5 font-body-md text-body-md text-[#24140D] focus:outline-none focus:border-[#C88421] shadow-inner font-bold"
              required
            />
          </div>

          {/* Avatar Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-[#5B3317] uppercase font-black">
              SELECT WARRIOR AVATAR
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = avatar === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setAvatar(opt.id);
                      setAvatarName(opt.name);
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${isSelected
                        ? 'bg-gradient-to-b from-[#FFF2D7] to-[#F5DDB3] border-[#C88421] shadow-[0_4px_12px_rgba(150,90,30,0.3)] scale-105'
                        : 'bg-[#FFFDF6] border-[#D8C7B5] hover:border-[#C88421] text-[#895333]'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#3C2314] text-[#FBD46E] flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                    </div>
                    <span className="font-label-sm text-xs font-bold text-[#24140D] text-center leading-tight">
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Banner Pattern Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-[#5B3317] uppercase font-black">
              SELECT CLAN BANNER PATTERN
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {BANNER_PATTERNS.map((bp) => {
                const isSelected = bannerPattern === bp.id;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setBannerPattern(bp.id);
                    }}
                    className={`h-12 rounded-xl ${bp.class} p-2 flex items-center justify-center border-2 transition-all cursor-pointer ${isSelected ? 'border-[#F5B823] ring-2 ring-[#F5B823] scale-105 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                  >
                    <span className="font-label-sm text-xs text-white uppercase font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {bp.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Banner Edit Panel Toggle & Controls */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF6] border-2 border-[#C89437] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#895333] text-lg">wallpaper</span>
                <span className="font-label-md text-xs text-[#5B3317] uppercase font-black">
                  EDIT BANNER OPTIONS (CUSTOM IMAGE & OVERLAY)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowEditBannerOptions(!showEditBannerOptions)}
                className="px-3 py-1 rounded-lg bg-[#FAF5ED] border border-[#CDB194] text-[#5C381E] font-label-sm text-xs font-bold uppercase hover:bg-[#FFF2D7] cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">{showEditBannerOptions ? 'expand_less' : 'tune'}</span>
                <span>{showEditBannerOptions ? 'Hide' : 'Edit Banner'}</span>
              </button>
            </div>

            {showEditBannerOptions && (
              <div className="flex flex-col gap-3.5 pt-2 border-t border-[#E7D6C3] animate-fadeIn">
                {/* Custom Image File or URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[11px] text-[#895333] uppercase font-bold">
                    Custom Banner Image File or URL
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#F5B823] to-[#B28212] text-[#3E2207] font-headline-sm text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                      <span className="material-symbols-outlined text-sm">upload</span>
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={handleBannerFileUpload} className="hidden" />
                    </label>
                    <input
                      type="url"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="Paste image URL..."
                      className="w-full bg-[#FFF] border border-[#CDB194] rounded-xl px-3 py-1.5 font-body-sm text-xs text-[#24140D]"
                    />
                    {bannerUrl && (
                      <button
                        type="button"
                        onClick={() => setBannerUrl('')}
                        className="px-2.5 py-1 rounded-xl bg-[#FEECEC] text-[#B71C1C] text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Banner Title Overlay */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[11px] text-[#895333] uppercase font-bold">
                    Banner Title / Slogan Overlay
                  </label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="e.g. VALKYRIE CITADEL"
                    maxLength={35}
                    className="w-full bg-[#FFF] border border-[#CDB194] rounded-xl px-3 py-1.5 font-body-sm text-xs text-[#24140D] font-bold"
                  />
                </div>

                {/* Banner Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[11px] text-[#895333] uppercase font-bold">
                    Banner Filter Effect
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'none', label: 'Original' },
                      { id: 'dark', label: 'Dark Shadow' },
                      { id: 'golden', label: 'Golden Glow' },
                      { id: 'dramatic', label: 'War Contrast' },
                      { id: 'sepia', label: 'Ancient' },
                      { id: 'blur', label: 'Fog' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setBannerFilter(f.id)}
                        className={`py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${bannerFilter === f.id
                            ? 'bg-[#C89437] text-white shadow-sm'
                            : 'bg-[#FAF5ED] text-[#6E4C38] border border-[#E5D2BF]'
                          }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bio / Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-[#5B3317] uppercase font-black">
              WARRIOR BIO & DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a brief tactical bio or battle motto about your chieftain..."
              rows={3}
              className="w-full bg-[#FFFDF6] border-2 border-[#895333] rounded-xl p-3 font-body-md text-body-md text-[#24140D] placeholder:text-[#9A7D69] focus:outline-none focus:border-[#C88421] shadow-inner"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8DAC9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { sfx.playClick(); onClose(); }}
              className="px-5 py-2.5 rounded-xl bg-[#E8DAC9] border border-[#CBAF90] text-[#553013] font-headline-sm text-xs font-black uppercase hover:bg-[#DCC8B0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-b from-[#F5B823] to-[#B28212] text-[#3E2207] font-headline-sm text-xs font-black uppercase tracking-wider shadow-[0_3px_0_#5C4200] hover:brightness-105 active:translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <span>SAVE WARRIOR PROFILE</span>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* Banner Cropper Modal (4:1 Ratio) */}
      <BannerCropperModal
        isOpen={isCropperOpen}
        imageSrc={cropperImageSrc}
        onClose={() => setIsCropperOpen(false)}
        onSave={(croppedUrl) => {
          setBannerUrl(croppedUrl);
          setIsCropperOpen(false);
          setStatusMessage('⚔️ Banner cropped & positioned!');
        }}
      />
    </div>
  );
};
